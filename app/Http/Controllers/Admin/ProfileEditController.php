<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileEditController extends Controller
{
    /**
     * View all pending account information changes, sorted by most recent first.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $pendingEdits = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->leftJoin('resident_profiles', 'users.id', '=', 'resident_profiles.user_id')
            ->where('users.barangay_id', $barangayId)
            ->where('profile_edit_requests.status', 'pending')
            ->orderBy('profile_edit_requests.created_at', 'desc') // <--- Displays the recent one at the top
            ->select(
                'profile_edit_requests.id',
                'profile_edit_requests.user_id',
                'users.account_id',
                'users.first_name',
                'users.middle_name',
                'users.last_name',
                'users.name_extension',
                'users.email as current_email',
                'users.mobile as current_mobile',
                'users.parent_name as current_parent_name',
                'users.parent_contact as current_parent_contact',
                'resident_profiles.house_street',
                'resident_profiles.barangay_name',
                'resident_profiles.city',
                'resident_profiles.province',
                'resident_profiles.sex',
                'resident_profiles.civil_status',
                'resident_profiles.birthday',
                'profile_edit_requests.requested_changes', 
                'profile_edit_requests.created_at'
            )
            ->get()
            ->map(function ($edit) {
                $decoded = $edit->requested_changes;
                if (is_string($decoded)) {
                    $decoded = json_decode($decoded, true);
                    if (is_string($decoded)) {
                        $decoded = json_decode($decoded, true);
                    }
                }

                $currentFullName = trim(($edit->first_name ?? '') . ' ' . ($edit->middle_name ? $edit->middle_name . ' ' : '') . ($edit->last_name ?? '') . ($edit->name_extension ? ' ' . $edit->name_extension : ''));
                
                return [
                    'id' => $edit->id,
                    'user_id' => $edit->user_id,
                    'account_id' => $edit->account_id,
                    'resident_name' => $currentFullName,
                    'current_values' => [
                        'first_name' => $edit->first_name ?? '—',
                        'middle_name' => $edit->middle_name ?? '—',
                        'last_name' => $edit->last_name ?? '—',
                        'name_extension' => $edit->name_extension ?? '—',
                        'full_name' => $currentFullName,
                        'email' => $edit->current_email ?? '—',
                        'mobile' => $edit->current_mobile ?? '—',
                        'parent_name' => $edit->current_parent_name ?? '—',
                        'parent_contact' => $edit->current_parent_contact ?? '—',
                        'sex' => $edit->sex ?? '—',
                        'civil_status' => $edit->civil_status ?? '—',
                        'birthday' => $edit->birthday ? \Carbon\Carbon::parse($edit->birthday)->format('Y-m-d') : '—',
                        'house_street' => $edit->house_street ?? '—',
                        'barangay_name' => $edit->barangay_name ?? '—',
                        'city' => $edit->city ?? '—',
                        'province' => $edit->province ?? '—',
                    ],
                    'requested_changes' => is_array($decoded) ? $decoded : [],
                    'submitted_at' => $edit->created_at ? \Carbon\Carbon::parse($edit->created_at)->format('M d, Y h:i A') : 'Recently',
                ];
            });

        return Inertia::render('Admin/ProfileEdits/Index', [
            'pendingEdits' => $pendingEdits
        ]);
    }

    /**
     * Approve change sets and write directly into the registry across users and resident_profiles.
     */
    public function approve(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;

        $editRequest = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('users.barangay_id', $barangayId)
            ->where('profile_edit_requests.id', $id)
            ->select('profile_edit_requests.*')
            ->first();

        if (!$editRequest) {
            abort(404, 'Modification record context missing.');
        }

        $changes = json_decode($editRequest->requested_changes, true);
        if (is_string($changes)) {
            $changes = json_decode($changes, true);
        }

        DB::transaction(function () use ($editRequest, $changes) {
            if (is_array($changes)) {
                $userAllowed = ['first_name', 'middle_name', 'last_name', 'name_extension', 'email', 'mobile', 'parent_name', 'parent_contact'];
                $profileAllowed = ['birthday', 'sex', 'civil_status', 'house_street', 'barangay_name', 'city', 'province'];

                $userUpdates = ['profile_edit_status' => 'none'];
                $profileUpdates = [];

                foreach ($changes as $key => $value) {
                    if (in_array($key, $userAllowed)) {
                        $userUpdates[$key] = $value;
                    }
                    if (in_array($key, $profileAllowed)) {
                        $profileUpdates[$key] = $value;
                    }
                }

                User::where('id', $editRequest->user_id)->update($userUpdates);

                if (!empty($profileUpdates)) {
                    DB::table('resident_profiles')
                        ->where('user_id', $editRequest->user_id)
                        ->update($profileUpdates);
                }
            }

            DB::table('profile_edit_requests')
                ->where('id', $editRequest->id)
                ->update([
                    'status' => 'approved',
                    'reviewed_by' => Auth::id(),
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);
        });

        return back()->with('success', 'Profile modifications successfully written to registry.');
    }

    /**
     * Dismiss modification demands.
     */
    public function reject(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;

        $editRequest = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('users.barangay_id', $barangayId)
            ->where('profile_edit_requests.id', $id)
            ->select('profile_edit_requests.*')
            ->first();

        if (!$editRequest) {
            abort(404, 'Modification record context missing.');
        }

        DB::transaction(function () use ($editRequest) {
            DB::table('profile_edit_requests')
                ->where('id', $editRequest->id)
                ->update([
                    'status' => 'rejected',
                    'reviewed_by' => Auth::id(),
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);

            User::where('id', $editRequest->user_id)->update([
                'profile_edit_status' => 'none'
            ]);
        });

        return back()->with('success', 'Profile update request rejected successfully.');
    }
}