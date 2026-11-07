<?php

namespace App\Http\Middleware;

use App\Enums\VerificationStatus;
use App\Enums\PersonnelShift;
use App\Models\Notification;
use App\Models\Personnel;
use App\Services\Missions\DepartmentMissionAccess;
use App\Models\ResidentRegistration;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
        $personnelDepartment = null;
        $personnelShift = null;

        if ($user) {
            $unreadCount = Notification::where('user_id', $user->id)
                ->where('is_read', false)
                ->count();
            
            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $user->load('residentProfile');
            }

            if ($roleValue === UserRole::Personnel->value) {
                $personnel = Personnel::query()->where('user_id', $user->id)->first();
                if ($personnel) {
                    $shift = $personnel->hasShiftSchedule()
                        ? PersonnelShift::tryFrom($personnel->shift ?? '')
                        : null;
                    $personnelDepartment = [
                        'value' => $personnel->department,
                        'label' => $personnel->department,
                        'description' => null,
                        'role' => $personnel->role,
                    ];
                    $personnelShift = [
                        'value' => $shift?->value,
                        'label' => $shift?->label(),
                        'hours' => $shift?->hours(),
                        'is_active' => (bool) ($user->is_active && $personnel->is_active),
                    ];
                    $unreadCount = app(DepartmentMissionAccess::class)
                        ->visibleNotifications(
                            $personnel,
                            Notification::query()->where('user_id', $user->id)->where('is_read', false)->get()
                        )
                        ->count();
                }
            }
            
            if ($roleValue === 'admin' || $roleValue === 'super_admin' || $roleValue === UserRole::Admin) {
                $badgeCounts = Cache::remember(
                    'inertia:admin-badges:'.($user->barangay_id ?? 'all'),
                    now()->addSeconds(10),
                    function () use ($user): array {
                        $counts = [
                            'registrations' => ResidentRegistration::query()
                                ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                                ->count(),
                            'reports' => 0,
                            'missions' => 0,
                            'blotters' => 0,
                            'profile_edits' => 0,
                            'map_alerts' => 0,
                        ];

                        try {
                            $counts['reports'] = DB::table('concerns')
                                ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                                ->where('status', 'ai_processed')
                                ->count();
                        } catch (\Exception $exception) {
                        }

                        try {
                            $counts['missions'] = DB::table('missions')
                                ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                                ->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])
                                ->count();
                        } catch (\Exception $exception) {
                        }

                        try {
                            $counts['blotters'] = DB::table('blotters')
                                ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                                ->where('status', 'pending')
                                ->count();
                        } catch (\Exception $exception) {
                        }

                        try {
                            $counts['profile_edits'] = DB::table('profile_edit_requests')
                                ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
                                ->when($user->barangay_id, fn ($query) => $query->where('users.barangay_id', $user->barangay_id))
                                ->where('profile_edit_requests.status', 'pending')
                                ->count();
                        } catch (\Exception $exception) {
                        }

                        try {
                            $counts['map_alerts'] = DB::table('concerns')
                                ->when($user->barangay_id, fn ($query) => $query->where('barangay_id', $user->barangay_id))
                                ->where(fn ($query) => $query->where('is_escalated', true)->orWhere('priority', 'high'))
                                ->where('status', '!=', 'verified')
                                ->count();
                        } catch (\Exception $exception) {
                        }

                        return $counts;
                    },
                );

                $pendingRegistrations = $badgeCounts['registrations'];
                $pendingReports = $badgeCounts['reports'];
                $pendingMissions = $badgeCounts['missions'];
                $pendingBlotters = $badgeCounts['blotters'];
                $pendingProfileEdits = $badgeCounts['profile_edits'];
                $pendingMapAlerts = $badgeCounts['map_alerts'];
            }
        }

        // Convert user to array and inject relation fields & is_minor status dynamically
        $userData = null;
        $showPasswordPrompt = false;
        if ($user) {
            $userData = array_merge($user->toArray(), [
                'is_minor' => $user->isMinor(),
                'civic_xp' => $user->residentProfile?->civic_xp ?? 0,
                'profile_photo_url' => $user->profilePhotoUrl(),
            ]);
            unset($userData['profile_photo_path']);

            $roleValue = $user->role instanceof \UnitEnum ? $user->role->value : $user->role;
            if ($roleValue === 'resident') {
                $status = $user->residentProfile?->verification_status;
                $isApproved = $status === VerificationStatus::Approved || $status === 'approved';
                $showPasswordPrompt = $isApproved
                    && $user->shouldShowPasswordPrompt()
                    && ! $request->session()->get('password_prompt_dismissed');
            } elseif ($roleValue === 'admin') {
                $showPasswordPrompt = $user->shouldShowPasswordPrompt()
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
                'new_credentials' => fn () => $request->session()->get('new_credentials'),
                'credentials' => fn () => $request->session()->get('credentials'),
                'new_admin_credentials' => fn () => $request->session()->get('new_admin_credentials'),
                'new_view_only_credentials' => fn () => $request->session()->get('new_view_only_credentials'),
            ],
            'unread_count' => $unreadCount,
            'personnel_department' => $personnelDepartment,
            'personnel_shift' => $personnelShift,
            'pending_registrations_count' => $pendingRegistrations,
            'pending_reports_count' => $pendingReports,
            'pending_missions_count' => $pendingMissions,
            'pending_blotters_count' => $pendingBlotters,
            'pending_profile_edits_count' => $pendingProfileEdits,
            'pending_map_alerts_count' => $pendingMapAlerts,
        ];
    }
}