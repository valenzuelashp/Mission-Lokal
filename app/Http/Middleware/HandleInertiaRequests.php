<?php

namespace App\Http\Middleware;

use App\Enums\VerificationStatus;
use App\Models\Notification;
use App\Models\ResidentRegistration;
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
        $pendingRegistrations = 0;
        if ($user) {
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $user->load('residentProfile');
            }
            if ($roleValue === 'admin' || $roleValue === 'super_admin') {
                $pendingRegistrations = ResidentRegistration::query()
                    ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                    ->count();
            }
        }

        // Convert user to array and inject relation fields & is_minor status dynamically
        $userData = null;
        $showPasswordPrompt = false;
        if ($user) {
            $userData = array_merge($user->toArray(), [
                'is_minor' => $user->isMinor(),
                'civic_xp' => $user->residentProfile?->civic_xp ?? 0,
            ]);

            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $status = $user->residentProfile?->verification_status;
                $isApproved = $status === VerificationStatus::Approved || $status === 'approved';
                $showPasswordPrompt = $isApproved
                    && $user->shouldShowPasswordPrompt()
                    && ! $request->session()->get('password_prompt_dismissed');
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
                'needs_password_setup' => $user ? $user->needsPasswordSetup() : false,
                'show_password_prompt' => $showPasswordPrompt,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'unread_count' => $unreadCount,
            'pending_registrations_count' => $pendingRegistrations,
        ];
    }
}