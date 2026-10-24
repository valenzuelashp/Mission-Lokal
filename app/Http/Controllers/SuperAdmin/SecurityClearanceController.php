<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ClearanceRequest;
use App\Mail\ClearanceKeyMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class SecurityClearanceController extends Controller
{
    public function index(): Response
    {
        $requests = ClearanceRequest::with(['admin:id,first_name,last_name,email,account_id', 'barangay:id,name'])
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'created_at' => $req->created_at ? $req->created_at->format('M d, Y h:i A') : 'Recently',
                    'admin' => [
                        'first_name' => $req->admin->first_name ?? '',
                        'last_name' => $req->admin->last_name ?? '',
                        'email' => $req->admin->email ?? 'N/A',
                        'account_id' => $req->admin->account_id ?? 'N/A',
                    ],
                    'barangay' => [
                        'name' => $req->barangay->name ?? 'Unknown Node',
                    ],
                ];
            });

        return Inertia::render('SuperAdmin/ClearanceRequests/Index', [
            'requests' => $requests
        ]);
    }

    public function approve(string $id): RedirectResponse
    {
        $clearance = ClearanceRequest::with('admin')->findOrFail($id);
        
        // Generate a random 10-char alphanumeric key
        $key = strtoupper(Str::random(10));

        // Save to cache for 2 hours
        Cache::put('clearance_key_' . $clearance->admin_id, $key, now()->addHours(2));

        // Send Email
        try {
            Mail::to($clearance->admin->email)->send(new ClearanceKeyMail($key));
        } catch (\Exception $e) {}

        $clearance->update(['status' => 'approved']);

        return back()->with('success', 'Clearance Key generated and securely emailed to the Admin.');
    }

    public function reject(string $id): RedirectResponse
    {
        ClearanceRequest::where('id', $id)->update(['status' => 'rejected']);
        return back()->with('success', 'Clearance request rejected.');
    }
}