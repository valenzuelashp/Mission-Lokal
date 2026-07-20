<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PreloadedResident;
use App\Enums\VerificationStatus;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VerificationController extends Controller
{
    // 1. Show the list of everyone waiting in line
    public function index(Request $request)
    {
        $barangayId = $request->user()->barangay_id;

        $users = User::with('residentProfile')
            ->where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->where(function ($query) {
                $query->where('verification_status', 'pending')
                      ->orWhere('verification_status', 'in_progress');
            })
            ->orderBy('updated_at', 'asc')
            ->get();

        $queue = $users->map(function ($user) {
            return [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'verification_status' => $user->verification_status?->value ?? $user->verification_status ?? 'pending', 
                'created_at' => $user->created_at ? $user->created_at->toIso8String() : null,
            ];
        });

        return Inertia::render('Admin/Verifications/Index', [
            'queue' => $queue
        ]);
    }

    // 2. Open a specific resident to review their ID
    public function show(Request $request, string $id)
    {
        $barangayId = $request->user()->barangay_id;

        $user = User::where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->findOrFail($id);

        // When the admin opens it, change status to In Progress!
        if ($user->verification_status === 'pending' || $user->verification_status === VerificationStatus::Pending) {
            $user->verification_status = 'in_progress';
            $user->save();
        }

        // Get their official census record to compare against
        $censusData = PreloadedResident::where('account_id', $user->account_id)->first();
        $user->load('residentProfile');

        return Inertia::render('Admin/Verifications/Show', [
            'resident' => $user,
            'censusData' => $censusData
        ]);
    }

    // 3. Approve the Resident
    public function approve(Request $request, string $id)
    {
        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->findOrFail($id);

        $user->verification_status = 'approved';
        $user->verified_at = now();
        $user->verified_by = Auth::id();
        $user->save();

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Resident officially verified!');
    }

    // 4. Reject the Resident (Requires a reason)
    public function reject(Request $request, string $id)
    {
        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string|max:255'
        ]);

        $user->verification_status = 'rejected';
        $user->save();

        // Save the reason to their profile so they can see it
        $profile = $user->residentProfile;
        if ($profile) {
            $profile->rejection_reason = $request->rejection_reason;
            $profile->save();
        }

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Resident rejected. They have been notified to re-upload.');
    }

    // Ensure this method handles the path correctly
    public function viewId(Request $request, string $path)
    {
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            abort(403);
        }

        if (!str_starts_with($path, 'private/')) {
            $path = 'private/' . $path;
        }
        $fullPath = storage_path('app/' . $path);

        if (!\Illuminate\Support\Facades\File::exists($fullPath)) {
            abort(404, "File missing from server."); 
        }

        $file = \Illuminate\Support\Facades\File::get($fullPath);
        $type = \Illuminate\Support\Facades\File::mimeType($fullPath);

        return response($file, 200)->header("Content-Type", $type);
    }
}