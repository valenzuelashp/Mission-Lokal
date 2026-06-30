<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BlotterController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        // 1. Fetch only the blotters where complainant_id matches the logged-in user
        $blotters = Blotter::where('complainant_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(function ($blotter) {
                return [
                    'id' => $blotter->id,
                    'ticket_number' => $blotter->ticket_number,
                    'type' => $blotter->type === 'two_party' ? 'Two-Party Dispute' : 'One-Party Log',
                    'incident_date' => $blotter->incident_at ? $blotter->incident_at->format('M d, Y') : 'Unknown Date',
                    'status' => $blotter->status,
                    'created_at' => $blotter->created_at->format('M d, Y'),
                ];
            });

        return \Inertia\Inertia::render('Resident/Blotter/Index', [
            'blotters' => $blotters
        ]);
    }
    public function store(Request $request): RedirectResponse
    {
        // 1. Strictly validate the legal requirements
        $validated = $request->validate([
            'type' => 'required|in:two_party,one_party',
            'respondent_name' => 'required_if:type,two_party|nullable|string|max:255',
            'narrative' => 'required|string',
            'incident_at' => 'required|date',
            'incident_address' => 'required|string|max:512',
            'relief_sought' => 'nullable|string',
        ]);

        $user = $request->user();

        // 2. Save the formal legal record!
        Blotter::create([
            'barangay_id' => $user->barangay_id,
            'complainant_id' => $user->id,
            'type' => $validated['type'],
            'respondent_name' => $validated['respondent_name'],
            'narrative' => $validated['narrative'],
            'incident_at' => $validated['incident_at'],
            'incident_address' => $validated['incident_address'],
            'relief_sought' => $validated['relief_sought'],
            'status' => 'pending_approval', 
        ]);

        return redirect()->route('feed')->with('success', 'Formal blotter submitted. You will receive a ticket number once reviewed by the admin desk.');
    }
}