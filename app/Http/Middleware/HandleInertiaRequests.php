<?php

namespace App\Http\Middleware;

use App\Enums\VerificationStatus;
use App\Models\Notification;
use App\Models\ResidentRegistration;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Dynamically count unread notifications & admin queue badges
        $unreadCount = 0;
        $pendingRegistrations = 0;
        $pendingReports = 0;
        $pendingMissions = 0;
        $pendingBlotters = 0;
        $pendingProfileEdits = 0;
        $pendingMapAlerts = 0;

        if ($user) {
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $user->load('residentProfile');
            }
            
            if ($roleValue === 'admin' || $roleValue === 'super_admin' || $roleValue === UserRole::Admin) {
                // 1. Verifications (Pending resident registrations waiting for review)
                $pendingRegistrations = ResidentRegistration::query()
                    ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                    ->count();

                // 2. Report Queue (Strictly reports with 'ai_processed' status waiting for admin review)
                try {
                    $pendingReports = DB::table('concerns')
                        ->when($user->barangay_id, fn ($q) => $q->where('barangay_id', $user->barangay_id))
                        ->where('status', 'ai_processed')
                        ->count();
                } catch (\Exception $e) {}

                // 3. Mission Queue (Counting assigned, acknowledged, and in_progress from the missions table)
                try {
                    $pendingMissions = DB::table('missions')
                        ->when($user->barangay_id, fn ($q) => $q->where('barangay_id', $user->barangay_id))
                        ->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])
                        ->count();
                } catch (\Exception $e) {}

                // 4. Blotters (Pending resident complaints/blotters)
                try {
                    $pendingBlotters = DB::table('blotters')
                        ->when($user->barangay_id, fn ($q) => $q->where('barangay_id', $user->barangay_id))
                        ->where('status', 'pending')
                        ->count();
                } catch (\Exception $e) {}

                // 5. Profile Requests (Pending resident information change requests)
                try {
                    $pendingProfileEdits = DB::table('profile_edit_requests')
                        ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
                        ->when($user->barangay_id, fn ($q) => $q->where('users.barangay_id', $user->barangay_id))
                        ->where('profile_edit_requests.status', 'pending')
                        ->count();
                } catch (\Exception $e) {}

                // 6. Map Alerts (Escalated concerns or high priority markers)
                try {
                    $pendingMapAlerts = DB::table('concerns')
                        ->when($user->barangay_id, fn ($q) => $q->where('barangay_id', $user->barangay_id))
                        ->where(function($query) {
                            $query->where('is_escalated', true)->orWhere('priority', 'high');
                        })
                        ->where('status', '!=', 'verified')
                        ->count();
                } catch (\Exception $e) {}
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
            'pending_reports_count' => $pendingReports,
            'pending_missions_count' => $pendingMissions,
            'pending_blotters_count' => $pendingBlotters,
            'pending_profile_edits_count' => $pendingProfileEdits,
            'pending_map_alerts_count' => $pendingMapAlerts,
        ];
    }
}