<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Concern;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class ReportController extends Controller
{
    private function validateTransition(string $current, string $next): bool
    {
        $map = [
            'submitted'    => ['under_review', 'rejected'],
            'under_review' => ['active', 'in_progress', 'rejected'],
            'in_progress'  => ['resolved'],
            'active'       => ['resolved', 'closed'],
            'resolved'     => ['closed'],
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
        $barangayId = $request->user()->barangay_id;
        $record = Concern::where('barangay_id', $barangayId)->with('media')->findOrFail($id);
        
        $locationData = DB::selectOne("SELECT ST_X(location) as lng, ST_Y(location) as lat FROM concerns WHERE id = ?", [$record->id]);
        
        $personnelList = User::where('barangay_id', $barangayId)
            ->where('role', 'personnel')
            ->where('is_active', 1)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name ?? $user->account_id,
                ];
            });

        $masterCandidates = Concern::where('barangay_id', $barangayId)
            ->where('id', '!=', $id)
            ->whereIn('status', ['active', 'resolved', 'closed', 'under_review'])
            ->select('id', 'title')
            ->get()
            ->map(fn($c) => ['id' => $c->id, 'label' => $c->title]);

        return Inertia::render('Admin/Reports/Show', [
            'report' => [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'status' => $record->status->value ?? $record->status,
                'location_label' => $record->address_text ?? 'Unknown Location',
                'severity' => $record->severity ?? 'medium',
                'lat' => $locationData ? (float) $locationData->lat : 14.6507,
                'lng' => $locationData ? (float) $locationData->lng : 120.9793,
                'images' => $record->media->sortBy('sort_order')->map(fn($m) => asset('storage/' . $m->storage_key))->values()->toArray(),
            ],
            'personnel' => $personnelList,
            'masterCandidates' => $masterCandidates,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $validated = $request->validate(['status' => 'required|string']);

        if (!$this->validateTransition($concern->status, $validated['status'])) {
            return back()->withErrors(['status' => 'Invalid status transition.']);
        }

        $concern->update(['status' => $validated['status'], 'staff_reviewed_by' => Auth::id()]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'UPDATE',
            'entity_type' => 'Concern',
            'entity_id' => $id,
            'metadata' => json_encode(['details' => 'Updated report status to: ' . $validated['status']]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Status updated.');
    }

    public function confirmAI(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        
        $concern->update(['status' => 'under_review']); 
        
        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'CONFIRM',
            'entity_type' => 'Concern',
            'entity_id' => $id,
            'metadata' => json_encode(['details' => 'Confirmed AI analysis for report: ' . $concern->title]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'AI verified.');
    }

    public function mergeDuplicate(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        
        $concern->update([
            'status' => 'closed', 
            'duplicate_of_id' => $request->master_concern_id,
            'closed_summary' => 'Merged as a duplicate concern.'
        ]);
        
        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'MERGE',
            'entity_type' => 'Concern',
            'entity_id' => $id,
            'metadata' => json_encode(['details' => 'Merged duplicate report into master record ID: ' . $request->master_concern_id]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.reports.index')->with('success', 'Merged successfully.');
    }

    public function rejectConcern(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $concern->update(['status' => 'rejected', 'closed_summary' => $request->rejection_reason]);
        
        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'REJECT',
            'entity_type' => 'Concern',
            'entity_id' => $id,
            'metadata' => json_encode(['details' => 'Rejected report due to: ' . $request->rejection_reason]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        
        Notification::create([
            'user_id' => $concern->reporter_id,
            'channel' => 'in_app',
            'event_type' => 'concern_rejected',
            'title' => 'Concern Rejected',
            'body' => 'Your report was rejected: ' . $request->rejection_reason,
            'payload' => ['concern_id' => $concern->id],
        ]);

        return redirect()->route('admin.reports.index')->with('success', 'Rejected.');
    }

    public function createMission(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $validated = $request->validate(['assigned_team' => 'required', 'mission_notes' => 'nullable']);

        $missionId = DB::transaction(function () use ($concern, $validated, $barangayId, $id, $request) {
            $missionId = Str::uuid();
            
            DB::table('missions')->insert([
                'id' => $missionId,
                'barangay_id' => $barangayId,
                'concern_id' => $concern->id,
                'assigned_to' => $validated['assigned_team'],
                'status' => 'assigned',
                'created_by' => $request->user()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            $concern->update(['status' => 'active']);
            
            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'ESCALATE',
                'entity_type' => 'Mission',
                'entity_id' => (string) $missionId,
                'metadata' => json_encode(['details' => 'Escalated report into field mission assigned to personnel ID: ' . $validated['assigned_team']]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            return $missionId;
        });

        Notification::create([
            'user_id' => $concern->reporter_id,
            'channel' => 'in_app',
            'event_type' => 'concern_active',
            'title' => 'Concern Active',
            'body' => 'A mission has been deployed to address your report.',
            'payload' => ['concern_id' => $concern->id],
        ]);

        return redirect()->route('admin.missions.index')->with('success', 'Mission deployed.');
    }
}