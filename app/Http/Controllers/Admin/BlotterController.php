<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blotter;
use App\Services\AuditLogger; // Added AuditLogger
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class BlotterController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        $blotters = Blotter::with('complainant')
            ->where('barangay_id', $barangayId)
            ->latest()
            ->get()
            ->map(fn($b) => [
                'id' => $b->id,
                'ticket_number' => $b->ticket_number ?? 'Pending Review',
                'type' => $b->type === 'two_party' ? 'Two-Party' : 'One-Party',
                'complainant' => $b->complainant->full_name ?? $b->complainant->account_id ?? 'Unknown',
                'respondent' => $b->respondent_name ?? 'N/A',
                'incident_date' => $b->incident_at ? $b->incident_at->format('M d, Y') : 'N/A',
                'status' => $b->status ?? 'pending_approval',
                'created_at' => $b->created_at ? $b->created_at->format('M d, Y') : 'Recently',
            ]);

        return Inertia::render('Admin/Blotters/Index', ['blotters' => $blotters]);
    }

    public function show(Request $request, string $id): Response
    {
        $blotter = Blotter::with('complainant')->where('barangay_id', $request->user()->barangay_id)->findOrFail($id);

        return Inertia::render('Admin/Blotters/Show', [
            'blotter' => [
                'id' => $blotter->id,
                'ticket_number' => $blotter->ticket_number,
                'type' => $blotter->type === 'two_party' ? 'Two-Party Dispute' : 'One-Party Log',
                'complainant' => $blotter->complainant->full_name ?? $blotter->complainant->account_id ?? 'Unknown',
                'respondent' => $blotter->respondent_name ?? 'N/A',
                'incident_date' => $blotter->incident_at ? $blotter->incident_at->format('F d, Y - h:i A') : 'Unknown Date',
                'location' => $blotter->incident_address ?? 'No physical location logged',
                'narrative' => $blotter->narrative ?? 'No statement detailed.',
                'relief_sought' => $blotter->relief_sought ?? 'None specified',
                'status' => $blotter->status ?? 'pending_approval',
                'created_at' => $blotter->created_at ? $blotter->created_at->format('M d, Y') : 'Recently',
            ]
        ]);
    }

    public function approve(Request $request, string $id): \Illuminate\Http\RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;

        DB::transaction(function () use ($barangayId, $id, $request) {
            // Lock the row to prevent race conditions during ticket generation
            $blotter = Blotter::where('barangay_id', $barangayId)
                ->where('id', $id)
                ->where('status', 'pending_approval')
                ->lockForUpdate()
                ->firstOrFail();

            $year = now()->format('Y');
            // Count existing tickets in this barangay for this year
            $count = Blotter::where('barangay_id', $barangayId)
                ->where('status', 'filed')
                ->whereYear('approved_at', $year)
                ->count();
            
            $ticketNumber = 'BL-' . $year . '-' . str_pad($count + 1, 4, '0', STR_PAD_LEFT);

            $blotter->update([
                'status' => 'filed',
                'ticket_number' => $ticketNumber,
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);

            // Audit the mutation
            AuditLogger::log('APPROVE_BLOTTER', 'Blotter', $id, ['ticket_number' => $ticketNumber]);
        });

        return back()->with('success', "Blotter filed successfully.");
    }
}