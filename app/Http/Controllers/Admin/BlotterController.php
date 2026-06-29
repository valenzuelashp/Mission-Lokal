<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;

class BlotterController extends Controller
{
    public function index(): Response
    {
        // Fetch all blotters, eagerly loading the complainant's user data
        $blotters = Blotter::with('complainant')
            ->latest()
            ->get()
            ->map(function ($blotter) {
                return [
                    'id' => $blotter->id,
                    'ticket_number' => $blotter->ticket_number ?? 'Pending Review',
                    'type' => $blotter->type === 'two_party' ? 'Two-Party' : 'One-Party',
                    'complainant' => $blotter->complainant->full_name ?? $blotter->complainant->account_id ?? 'Unknown',
                    'respondent' => $blotter->respondent_name ?? 'N/A',
                    'incident_date' => $blotter->incident_at ? $blotter->incident_at->format('M d, Y') : 'N/A',
                    'status' => $blotter->status,
                    'created_at' => $blotter->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Blotters/Index', [
            'blotters' => $blotters
        ]);
    }
    public function show(string $id): Response
    {
        $blotter = Blotter::with('complainant')->findOrFail($id);

        $formattedBlotter = [
            'id' => $blotter->id,
            'ticket_number' => $blotter->ticket_number,
            'type' => $blotter->type === 'two_party' ? 'Two-Party Dispute' : 'One-Party Log',
            'complainant' => $blotter->complainant->full_name ?? $blotter->complainant->account_id ?? 'Unknown',
            'respondent' => $blotter->respondent_name ?? 'N/A',
            'incident_date' => $blotter->incident_at ? $blotter->incident_at->format('F d, Y - h:i A') : 'Unknown Date',
            'location' => $blotter->incident_address,
            'narrative' => $blotter->narrative,
            'relief_sought' => $blotter->relief_sought ?? 'None specified',
            'status' => $blotter->status,
            'created_at' => $blotter->created_at->format('M d, Y'),
        ];

        return Inertia::render('Admin/Blotters/Show', [
            'blotter' => $formattedBlotter
        ]);
    }

    public function approve(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $blotter = Blotter::findOrFail($id);

        // Security: Don't approve if already approved
        if ($blotter->status !== 'pending_approval') {
            return back()->with('error', 'This blotter has already been processed.');
        }

        // Generate an official Ticket Number (e.g., BL-2026-0001)
        $year = now()->format('Y');
        $count = Blotter::where('barangay_id', $blotter->barangay_id)->count();
        $ticketNumber = 'BL-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

        $blotter->update([
            'status' => 'filed',
            'ticket_number' => $ticketNumber,
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', "Blotter officially filed. Ticket Number: {$ticketNumber}");
    }
}