<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BlotterController extends Controller
{
    /**
     * Fetch only the blotters where complainant_id matches the logged-in user.
     */
    public function index(Request $request): Response
    {
        $blotters = Blotter::where('complainant_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(function ($blotter) {
                return [
                    'id' => (string) $blotter->id,
                    // FIX: Gracefully handle items that don't have a ticket number yet while pending review
                    'ticket_number' => $blotter->ticket_number ?? 'Pending Review',
                    'type' => $blotter->type === 'two_party' ? 'Two-Party Dispute' : 'One-Party Log',
                    'incident_date' => $blotter->incident_at ? $blotter->incident_at->format('M d, Y') : 'Unknown Date',
                    'status' => $blotter->status,
                    'created_at' => $blotter->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Resident/Blotter/Index', [
            'blotters' => $blotters
        ]);
    }

    /**
     * Store a formal legal blotter record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:two_party,one_party'],
            'respondent_name' => ['required_if:type,two_party', 'nullable', 'string', 'max:255'],
            'narrative' => ['required', 'string', 'min:10'],
            'incident_at' => ['required', 'date'],
            'incident_address' => ['required', 'string', 'max:512'],
            'relief_sought' => ['nullable', 'string'],
            // Check for optional witness array structures matching the json model cast
            'witnesses' => ['nullable', 'array'],
            'witnesses.*' => ['string', 'max:255'],
        ], [
            'respondent_name.required_if' => 'The respondent / other party field is required for two-party disputes.',
            'narrative.required' => 'The statement of facts field is required.',
        ]);

        $user = $request->user();

        Blotter::create([
            'barangay_id' => $user->barangay_id,
            'complainant_id' => $user->id,
            'type' => $validated['type'],
            'respondent_name' => $validated['respondent_name'],
            'narrative' => $validated['narrative'],
            'incident_at' => $validated['incident_at'],
            'incident_address' => $validated['incident_address'],
            'relief_sought' => $validated['relief_sought'],
            'witnesses' => $request->input('witnesses', []), // Clean fallback to empty json array
            'status' => 'pending_approval', 
        ]);

        return redirect()->route('blotters.index')->with('success', 'Formal blotter submitted. You will receive a ticket number once reviewed by the admin desk.');
    }
}