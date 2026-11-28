<?php

namespace App\Services;

use App\Jobs\LocateLoginActivity;
use App\Models\LoginActivity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SessionSecurity
{
    public function activate(Request $request, User $user): void
    {
        $remember = $request->boolean('remember') || Auth::viaRemember();
        $token = Str::random(64);
        $activityId = DB::transaction(function () use ($request, $user, $token) {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();
            User::whereKey($user->id)->update(['active_session_token' => $token, 'session_locked_at' => null, 'session_away_at' => null, 'last_login_at' => now(), 'remember_token' => Str::random(60)]);
            $user->refresh();
            if (config('session.default') === 'database') {
                DB::connection(config('session.connection'))->table(config('session.table', 'sessions'))->where('user_id', $user->id)->delete();
            }
            $agent = mb_substr((string) $request->userAgent(), 0, 2048);
            $activity = LoginActivity::create([
                'user_id' => $user->id, 'barangay_id' => $user->barangay_id,
                'account_id' => $user->account_id, 'user_name' => trim($user->first_name.' '.$user->last_name),
                'role' => $user->role instanceof \BackedEnum ? $user->role->value : $user->role,
                'ip_address' => $request->ip(), 'user_agent' => $agent,
                'browser' => $this->browser($agent), 'device' => $this->device($agent), 'signed_in_at' => now(),
            ]);

            return $activity->id;
        });
        $request->session()->regenerate();
        $request->session()->put('active_session_token', $token);
        // Reissue remember-me using the rotated token; a previous device cannot restore itself.
        if ($remember) {
            Auth::login($user, true);
        }
        try {
            LocateLoginActivity::dispatch($activityId)->onConnection('database');
        } catch (\Throwable) {
            // The audit entry and authenticated session remain valid if enrichment cannot be queued.
            Log::notice('Login location enrichment could not be queued.');
        }
    }

    public function matches(Request $request, User $user): bool
    {
        return is_string($user->active_session_token)
            && is_string($request->session()->get('active_session_token'))
            && hash_equals($user->active_session_token, $request->session()->get('active_session_token'));
    }

    public function state(User $user): array
    {
        $this->expireAwayLock($user);
        $remaining = $user->session_away_at && ! $user->session_locked_at
            ? max(0, $user->session_away_at->timestamp + $this->graceSeconds() - now()->timestamp) : null;

        return [
            'locked' => $user->session_locked_at !== null, 'needs_pin' => ! $user->session_pin_hash,
            'version' => (int) $user->session_lock_version, 'grace_seconds' => $this->graceSeconds(),
            'away_remaining_seconds' => $remaining,
            'context' => substr(hash('sha256', (string) $user->active_session_token), 0, 16),
        ];
    }

    public function graceSeconds(): int
    {
        return max(0, (int) config('session.pin_lock_grace_seconds', 120));
    }

    public function expireAwayLock(User $user): void
    {
        if (! $user->session_away_at || $user->session_locked_at !== null
            || $user->session_away_at->greaterThan(now()->subSeconds($this->graceSeconds()))) {
            return;
        }

        User::whereKey($user->id)->where('active_session_token', $user->active_session_token)
            ->whereNull('session_locked_at')->where('session_away_at', '<=', now()->subSeconds($this->graceSeconds()))
            ->update(['session_locked_at' => now(), 'session_away_at' => null, 'session_lock_version' => DB::raw('session_lock_version + 1')]);
        $user->refresh();
    }

    private function browser(string $agent): string
    {
        foreach (['Edg/' => 'Edge', 'OPR/' => 'Opera', 'Firefox/' => 'Firefox', 'Chrome/' => 'Chrome', 'Safari/' => 'Safari'] as $needle => $name) {
            if (str_contains($agent, $needle)) {
                return $name;
            }
        }

        return 'Unknown';
    }

    private function device(string $agent): string
    {
        foreach (['Android' => 'Android', 'iPhone' => 'iPhone', 'iPad' => 'iPad', 'Windows' => 'Windows', 'Macintosh' => 'macOS', 'Linux' => 'Linux'] as $needle => $name) {
            if (str_contains($agent, $needle)) {
                return $name;
            }
        }

        return 'Unknown';
    }
}
