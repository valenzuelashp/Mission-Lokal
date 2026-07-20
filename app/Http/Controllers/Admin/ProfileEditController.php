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
     * View all pending account information changes.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        // Switched to your exact table name: profile_edit_requests
        $pendingEdits = DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('users.barangay_id', $barangayId)
            ->where('profile_edit_requests.status', 'pending')
            ->select(
                'profile_edit_requests.id',
                'profile_edit_requests.user_id',
                'users.account_id',
                'users.first_name as current_first',
                'users.last_name as current_last',
                'profile_edit_requests.requested_changes', 
                'profile_edit_requests.created_at'
            )
            ->get()
            ->map(function ($edit) {
                return [
                    'id' => $edit->id,
                    'user_id' => $edit->user_id,
                    'account_id' => $edit->account_id,
                    'resident_name' => $edit->current_first . ' ' . $edit->current_last,
                    'requested_changes' => json_decode($edit->requested_changes, true),
                    'submitted_at' => $edit->created_at ? \Carbon\Carbon::parse($edit->created_at)->format('M d, Y h:i A') : 'Recently',
                ];
            });

        return Inertia::render('Admin/ProfileEdits/Index', [
            'pendingEdits' => $pendingEdits
        ]);
    }

    /**
     * Approve change sets and write directly into the users record.
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

        DB::transaction(function () use ($editRequest, $changes) {
            // 1. Commit changes directly to User model
            User::where('id', $editRequest->user_id)->update($changes);

            // 2. Mark the request resolved using your exact reviewed columns
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

        // Updates status to rejected and tracks the reviewer details using your column mapping
        DB::table('profile_edit_requests')
            ->join('users', 'profile_edit_requests.user_id', '=', 'users.id')
            ->where('users.barangay_id', $barangayId)
            ->where('profile_edit_requests.id', $id)
            ->update([
                'profile_edit_requests.status' => 'rejected',
                'profile_edit_requests.reviewed_by' => Auth::id(),
                'profile_edit_requests.reviewed_at' => now(),
                'profile_edit_requests.updated_at' => now(),
            ]);

        return back()->with('success', 'Profile update request rejected successfully.');
    }
}