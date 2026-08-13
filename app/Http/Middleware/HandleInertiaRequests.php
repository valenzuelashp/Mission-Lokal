<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Notification; // <-- Added the Notification model
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
            
            // NEW: Safely extract the role and load the profile so React knows if they uploaded an ID
            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $user->load('residentProfile');
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'needs_password_setup' => $user ? \Illuminate\Support\Facades\Hash::check('password', $user->password) : false,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            // Pass the dynamic count to the frontend React props
            'unread_count' => $unreadCount,
        ];
    }
}