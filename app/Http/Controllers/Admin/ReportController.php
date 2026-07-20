<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    private function validateTransition(string $current, string $next): bool
    {
        $map = [
            'submitted'    => ['under_review', 'rejected'],
            'under_review' => ['in_progress', 'rejected'],
            'in_progress'  => ['resolved'],
            'resolved'     => [],
            'rejected'     => [],
        ];
        return isset($map[$current]) && in_array($next, $map[$current]);
    }

    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        $concerns = Concern::where('barangay_id', $barangayId)->with('media')->latest()->get();

        $reports = $concerns->map(fn($c) => [
            'id' => substr($c->id, 0, 8),
            'concern_id' => $c->id,
            'incident_type' => $c->title,
            'status' => $c->status->value ?? $c->status,
            'queue_status' => match($c->status->value ?? $c->status) {
                'submitted', 'ai_processed' => 'ai_processed',
                'under_review' => 'under_review',
                'rejected', 'spam' => 'rejected',
                default => 'active',
            },
            'submitted_at' => $c->created_at?->format('M d, g:i A') ?? 'Just now',
        ]);

        return Inertia::render('Admin/Reports/Index', [
            'reports' => $reports,
            'counts' => [
                'all' => $reports->count(),
                'ai_processed' => $reports->where('queue_status', 'ai_processed')->count(),
                'under_review' => $reports->where('queue_status', 'under_review')->count(),
                'active' => $reports->where('queue_status', 'active')->count(),
                'rejected' => $reports->where('queue_status', 'rejected')->count(),
            ],
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $record = Concern::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        return Inertia::render('Admin/Reports/Show', [
            'report' => [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'status' => $record->status->value ?? $record->status,
            ]
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $concern = Concern::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $validated = $request->validate(['status' => 'required|string']);

        if (!$this->validateTransition($concern->status, $validated['status'])) {
            return back()->withErrors(['status' => 'Invalid status transition.']);
        }

        $concern->update(['status' => $validated['status'], 'staff_reviewed_by' => Auth::id()]);
        AuditLogger::log('UPDATE_STATUS', 'Concern', $id, ['new_status' => $validated['status']]);

        return back()->with('success', 'Status updated.');
    }

    public function confirmAI(Request $request, string $id): RedirectResponse
    {
        $concern = Concern::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $concern->update(['ai_verified' => true, 'status' => 'under_review']);
        AuditLogger::log('CONFIRM_AI', 'Concern', $id, ['ai_verified' => true]);
        return back()->with('success', 'AI verified.');
    }

    public function mergeDuplicate(Request $request, string $id): RedirectResponse
    {
        $concern = Concern::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $concern->update(['status' => 'merged', 'parent_id' => $request->master_concern_id]);
        AuditLogger::log('MERGE', 'Concern', $id, ['parent_id' => $request->master_concern_id]);
        return redirect()->route('admin.reports.index')->with('success', 'Merged.');
    }

    public function rejectConcern(Request $request, string $id): RedirectResponse
    {
        $concern = Concern::where('barangay_id', $request->user()->barangay_id)->findOrFail($id);
        $concern->update(['status' => 'rejected', 'closure_notes' => $request->rejection_reason]);
        AuditLogger::log('REJECT', 'Concern', $id, ['reason' => $request->rejection_reason]);
        return redirect()->route('admin.reports.index')->with('success', 'Rejected.');
    }

    public function createMission(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $validated = $request->validate(['assigned_team' => 'required', 'mission_notes' => 'nullable']);

        DB::transaction(function () use ($concern, $validated, $barangayId, $id) {
            $missionId = Str::uuid();
            DB::table('missions')->insert([
                'id' => $missionId,
                'barangay_id' => $barangayId,
                'concern_id' => $concern->id,
                'title' => 'Response: ' . $concern->title,
                'description' => $validated['mission_notes'] ?? $concern->description,
                'assigned_team' => $validated['assigned_team'],
                'status' => 'assigned',
                'created_at' => now(),
            ]);
            $concern->update(['status' => 'in_progress']);
            AuditLogger::log('CREATE_MISSION', 'Mission', $missionId, ['concern_id' => $id, 'team' => $validated['assigned_team']]);
        });

        return redirect()->route('admin.missions.index')->with('success', 'Mission deployed.');
    }
}