<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\SessionSecurity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SessionLockController extends Controller
{
    public function show(Request $request)
    {
        return Inertia::render('Auth/SessionLock', ['session_security' => app(SessionSecurity::class)->state($request->user())]);
    }

    public function status(Request $request)
    {
        return response()->json([...app(SessionSecurity::class)->state($request->user()), 'stream_enabled' => PHP_SAPI !== 'cli-server'])->header('Cache-Control', 'no-store');
    }

    public function lock(Request $request)
    {
        User::whereKey($request->user()->id)->where('active_session_token', $request->session()->get('active_session_token'))->update(['session_locked_at' => now(), 'session_away_at' => null, 'session_lock_version' => DB::raw('session_lock_version + 1')]);

        return response()->json(['locked' => true]);
    }

    public function away(Request $request)
    {
        $this->mutateCurrent($request, function (User $user) {
            app(SessionSecurity::class)->expireAwayLock($user);
            if ($user->session_pin_hash && $user->session_locked_at === null && $user->session_away_at === null) {
                $user->forceFill(['session_away_at' => now(), 'session_lock_version' => $user->session_lock_version + 1])->save();
            }
        });

        return response()->json(app(SessionSecurity::class)->state($request->user()->fresh()))->header('Cache-Control', 'no-store');
    }

    public function resume(Request $request)
    {
        $this->mutateCurrent($request, function (User $user) {
            app(SessionSecurity::class)->expireAwayLock($user);
            if ($user->session_locked_at === null && $user->session_away_at !== null) {
                $user->forceFill(['session_away_at' => null, 'session_lock_version' => $user->session_lock_version + 1])->save();
            }
        });

        return response()->json(app(SessionSecurity::class)->state($request->user()->fresh()))->header('Cache-Control', 'no-store');
    }

    public function unlock(Request $request)
    {
        $request->validate(['pin' => ['required', 'string', 'regex:/^\d{6}$/']]);
        $key = 'session-pin:'.$request->user()->id;
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['pin' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.']);
        }
        RateLimiter::hit($key, 300);
        $this->mutateCurrent($request, function (User $user) use ($request) {
            if (! $user->session_pin_hash || ! Hash::check($request->string('pin')->toString(), $user->session_pin_hash)) {
                throw ValidationException::withMessages(['pin' => 'Incorrect PIN.']);
            }
            $user->forceFill(['session_locked_at' => null, 'session_away_at' => null, 'session_lock_version' => $user->session_lock_version + 1])->save();
        });
        RateLimiter::clear($key);

        return $this->unlockedResponse($request);
    }

    public function setPin(Request $request)
    {
        $request->validate(['current_password' => ['required', 'current_password'], 'pin' => ['required', 'string', 'regex:/^\d{6}$/', 'confirmed']]);
        $this->mutateCurrent($request, fn (User $user) => $user->forceFill(['session_pin_hash' => Hash::make($request->string('pin')->toString()), 'session_locked_at' => null, 'session_away_at' => null, 'session_lock_version' => $user->session_lock_version + 1])->save());
        RateLimiter::clear('session-pin:'.$request->user()->id);

        return $this->unlockedResponse($request);
    }

    private function mutateCurrent(Request $request, callable $callback): void
    {
        DB::transaction(function () use ($request, $callback) {
            $user = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            abort_unless(app(SessionSecurity::class)->matches($request, $user), 401, 'Session revoked.');
            $callback($user);
        });
    }

    private function unlockedResponse(Request $request)
    {
        $target = $request->session()->pull('session_return_url', '/');
        if (! is_string($target) || ! str_starts_with($target, '/') || str_starts_with($target, '//')) {
            $target = '/';
        }

        return response()->json([...app(SessionSecurity::class)->state($request->user()->fresh()), 'return_url' => $target]);
    }

    public function events(Request $request)
    {
        $id = $request->user()->id;
        $token = $request->session()->get('active_session_token');
        $request->session()->save();

        return response()->stream(function () use ($id, $token) {
            $until = microtime(true) + (int) config('session.revocation_stream_seconds', 20);
            do {
                $user = User::find($id);
                $revoked = ! $user || ! is_string($token) || ! hash_equals((string) $user->active_session_token, $token);
                echo 'data: '.json_encode($revoked ? ['revoked' => true] : app(SessionSecurity::class)->state($user))."\n\n";
                if (ob_get_level()) {
                    @ob_flush();
                }
                flush();
                if ($revoked || connection_aborted()) {
                    break;
                }
                usleep(500000);
            } while (microtime(true) < $until);
        }, 200, ['Content-Type' => 'text/event-stream', 'Cache-Control' => 'no-store', 'X-Accel-Buffering' => 'no']);
    }
}
