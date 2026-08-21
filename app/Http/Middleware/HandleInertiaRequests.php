<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // Dynamically count unread notifications
        $unreadCount = 0;
        if ($user) {
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $user->load('residentProfile');
            }
        }

        // Convert user to array and inject is_minor status dynamically
        $userData = null;
        if ($user) {
            $userData = array_merge($user->toArray(), [
                'is_minor' => $user->isMinor(),
            ]);
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
                'needs_password_setup' => $user ? $user->needsPasswordSetup() : false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'unread_count' => $unreadCount,
        ];
    }
}