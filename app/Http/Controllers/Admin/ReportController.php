<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $concerns = Concern::latest()->get();

        $reports = $concerns->map(function ($concern) {
            $queueStatus = match($concern->status->value ?? $concern->status) {
                'submitted' => 'under_review',
                'ai_processed' => 'ai_processed',
                'rejected', 'spam' => 'rejected',
                default => 'active', 
            };

            return [
                'id' => substr($concern->id, 0, 8),
                'concern_id' => $concern->id,
                'incident_type' => $concern->title,
                'type_icon' => 'alert-triangle',
                'location' => $concern->address_text ?? 'Unknown location',
                'ai_severity' => $concern->severity ? 85 : 0, 
                'priority' => 'med',
                'status' => $concern->status->value ?? $concern->status,
                'ai_category' => 'Pending Classification',
                'visibility' => $concern->visibility,
                'queue_status' => $queueStatus,
                'submitted_at' => $concern->created_at->format('M d, g:i A'),
            ];
        });

        $counts = [
            'all' => $reports->count(),
            'ai_processed' => $reports->where('queue_status', 'ai_processed')->count(),
            'under_review' => $reports->where('queue_status', 'under_review')->count(),
            'active' => $reports->where('queue_status', 'active')->count(),
            'rejected' => $reports->where('queue_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports->values(),
            'counts' => $counts,
        ]);
    }

    // --- OPTION 1: THE DETAIL PAGE ---
    public function show(string $id): Response
    {
        $record = Concern::select(
            '*',
            DB::raw('ST_Y(location) as lat, ST_X(location) as lng')
        )->findOrFail($id);

        $reportDetail = [
            'id' => $record->id,
            'title' => $record->title,
            'description' => $record->description,
            'status' => $record->status->value ?? $record->status,
            'location' => $record->address_text ?? 'Unknown location',
            'lat' => $record->lat,
            'lng' => $record->lng,
            'submitted_at' => $record->created_at->format('M d, Y h:i A'),
            'images' => [], // Empty placeholder so React doesn't crash
            
            // Sending a safe fallback timeline just in case React expects it
            'timeline' => [
                [
                    'key' => 'submitted',
                    'label' => 'Report Received',
                    'state' => 'done',
                    'at' => $record->created_at->format('M d, Y h:i A')
                ]
            ]
        ];

        return Inertia::render('Admin/Reports/Show', [
            // I am sending BOTH of these prop names just to be safe, 
            // since I don't know exactly what your React teammates named it!
            'report' => $reportDetail,
            'concern' => $reportDetail, 
        ]);
    }

    // --- OPTION 2: THE ACTION BUTTONS (APPROVE/REJECT) ---
    public function update(Request $request, string $id): RedirectResponse
    {
        // 1. Ensure the React frontend sent us a valid status
        $validated = $request->validate([
            'status' => ['required', 'string'],
        ]);

        // 2. Find the report and update it in the database
        $concern = Concern::findOrFail($id);
        $concern->update([
            'status' => $validated['status']
        ]);

        // 3. Send them back to the detail page with a success flash message
        return back()->with('success', 'Report status successfully updated!');
    }
}