<?php

namespace App\Http\Controllers\SuperAdmin;

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
     * List all pending edit requests submitted by Barangay Admins
     */
    public function index(): Response
    {
        $pendingEdits = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->join('barangays', 'users.barangay_id', '=', 'barangays.id')
            ->where('profile_edit_requests.status', 'pending')
            ->where('users.role', 'admin') // ONLY get requests from Admins
            ->orderBy('profile_edit_requests.created_at', 'desc')
            ->select(
                'profile_edit_requests.id',
                'profile_edit_requests.user_id',
                'users.account_id',
                'users.first_name',
                'users.last_name',
                'users.email as current_email',
                'barangays.name as barangay_name',
                'barangays.house_street',
                'barangays.city',
                'barangays.province',
                'barangays.contact_phone',
                'barangays.contact_email',
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

                // Flatten the JSON payload so the frontend can easily read it
                $flatChanges = [];
                if (is_array($decoded)) {
                    if (isset($decoded['user'])) {
                        foreach ($decoded['user'] as $k => $v) $flatChanges[$k] = $v;
                    }
                    if (isset($decoded['barangay'])) {
                        foreach ($decoded['barangay'] as $k => $v) {
                            $flatChanges[$k === 'name' ? 'barangay_name' : $k] = $v;
                        }
                    }
                }

                return [
                    'id' => $edit->id,
                    'account_id' => $edit->account_id,
                    'admin_name' => trim($edit->first_name . ' ' . $edit->last_name),
                    'barangay_name' => $edit->barangay_name,
                    'current_values' => [
                        'first_name' => $edit->first_name ?? '—',
                        'last_name' => $edit->last_name ?? '—',
                        'email' => $edit->current_email ?? '—',
                        'barangay_name' => $edit->barangay_name ?? '—',
                        'house_street' => $edit->house_street ?? '—',
                        'city' => $edit->city ?? '—',
                        'province' => $edit->province ?? '—',
                        'contact_email' => $edit->contact_email ?? '—',
                        'contact_phone' => $edit->contact_phone ?? '—',
                    ],
                    'requested_changes' => $flatChanges,
                    'submitted_at' => $edit->created_at ? \Carbon\Carbon::parse($edit->created_at)->format('M d, Y h:i A') : 'Recently',
                ];
            });

        return Inertia::render('SuperAdmin/ProfileEdits/Index', [
            'pendingEdits' => $pendingEdits
        ]);
    }

    /**
     * Approve the Admin's request selectively based on approved_keys
     */
    public function approve(Request $request, string $id): RedirectResponse
    {
        $approvedKeys = $request->input('approved_keys', []);

        $editRequest = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('profile_edit_requests.id', $id)
            ->where('users.role', 'admin') // Security check
            ->select('profile_edit_requests.*', 'users.barangay_id')
            ->first();

        if (!$editRequest) {
            abort(404, 'Modification record context missing.');
        }

        $changes = json_decode($editRequest->requested_changes, true);
        if (is_string($changes)) {
            $changes = json_decode($changes, true);
        }

        DB::transaction(function () use ($editRequest, $changes, $approvedKeys) {
            $userUpdates = [];
            $barangayUpdates = [];
            $appliedChangesForAudit = [];

            if (is_array($changes)) {
                
                // Map the flat frontend keys back to the nested database columns
                $userKeys = ['first_name', 'last_name', 'email'];
                $barangayKeys = [
                    'barangay_name' => 'name', 
                    'house_street' => 'house_street', 
                    'city' => 'city', 
                    'province' => 'province', 
                    'contact_phone' => 'contact_phone', 
                    'contact_email' => 'contact_email'
                ];

                // 1. Process User Fields
                if (isset($changes['user'])) {
                    foreach ($userKeys as $key) {
                        if (in_array($key, $approvedKeys) && isset($changes['user'][$key])) {
                            $userUpdates[$key] = $changes['user'][$key];
                        }
                    }
                }

                // 2. Process Barangay Fields
                if (isset($changes['barangay'])) {
                    foreach ($barangayKeys as $flatKey => $dbKey) {
                        if (in_array($flatKey, $approvedKeys) && isset($changes['barangay'][$dbKey])) {
                            $barangayUpdates[$dbKey] = $changes['barangay'][$dbKey];
                        }
                    }
                }

                // Apply User Updates
                if (!empty($userUpdates)) {
                    $appliedChangesForAudit['user'] = $userUpdates; // Save for audit log
                    
                    $userUpdates['profile_edit_status'] = 'none';
                    User::where('id', $editRequest->user_id)->update($userUpdates);
                } else {
                    User::where('id', $editRequest->user_id)->update(['profile_edit_status' => 'none']);
                }

                // Apply Barangay Updates
                if (!empty($barangayUpdates) && $editRequest->barangay_id) {
                    $appliedChangesForAudit['barangay'] = $barangayUpdates; // Save for audit log
                    DB::table('barangays')->where('id', $editRequest->barangay_id)->update($barangayUpdates);
                }
            }

            // 3. Mark request as approved and overwrite the requested_changes JSON 
            // so the audit history only shows what was actually approved.
            DB::table('profile_edit_requests')
                ->where('id', $editRequest->id)
                ->update([
                    'status' => 'approved',
                    'requested_changes' => json_encode($appliedChangesForAudit),
                    'reviewed_by' => Auth::id(),
                    'reviewed_at' => now(),
                    'updated_at' => now(),
                ]);
        });

        return back()->with('success', 'Selected Admin and Barangay settings were successfully applied.');
    }

    /**
     * Reject the Admin's request entirely
     */
    public function reject(Request $request, string $id): RedirectResponse
    {
        $editRequest = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('profile_edit_requests.id', $id)
            ->where('users.role', 'admin') // Security check
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

        return back()->with('success', 'Admin update request rejected successfully.');
    }
}