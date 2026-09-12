<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Concern;
use App\Models\Mission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Personnel;
use App\Support\MapHelpers;

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
        $concerns = Concern::where('barangay_id', $barangayId)
            ->with(['media', 'category', 'currentAiAnalysis.suggestedCategory'])
            ->get();

        $reports = $concerns->map(function ($c) {
            $status = $c->status->value ?? $c->status;
            $priority = $this->priorityFor($c);

            return [
                'id' => substr($c->id, 0, 8),
                'concern_id' => $c->id,
                'incident_type' => $c->title,
                'type_icon' => MapHelpers::typeIconFromText($c->title, $c->description),
                'location' => $c->address_text ?? 'Unknown location',
                'ai_category' => $c->currentAiAnalysis?->suggestedCategory?->name
                    ?? $c->category?->name
                    ?? 'Uncategorized',
                'ai_severity' => MapHelpers::scoreFromSeverity($c->severity),
                'severity' => $c->severity ?? 'medium',
                'priority' => MapHelpers::priorityFromSeverity($c->severity),
                'priority_score' => $priority['score'],
                'priority_reason' => $priority['reason'],
                'visibility' => $c->visibility,
                'images' => $c->media->sortBy('sort_order')->map(fn ($m) => asset('storage/' . $m->storage_key))->values()->all(),
                'status' => $status,
                'queue_status' => match($status) {
                    'submitted', 'ai_processed' => 'ai_processed',
                    'under_review' => 'under_review',
                    'rejected', 'spam' => 'rejected',
                    default => 'active',
                },
                'submitted_at' => $c->created_at?->format('M d, g:i A') ?? 'Just now',
            ];
        })->sortByDesc('priority_score')->values();

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

    private function priorityFor(Concern $concern): array
    {
        $severityScore = match ($concern->severity) {
            'critical' => 400,
            'high' => 300,
            'medium' => 200,
            'low' => 100,
            default => 150,
        };
        $text = strtolower($concern->title . ' ' . $concern->description);
        $safetyTerms = ['fire', 'flood', 'live wire', 'electrical', 'collapse', 'injury', 'danger', 'gas leak', 'outbreak'];
        $safetyMatches = collect($safetyTerms)->filter(fn ($term) => str_contains($text, $term))->count();
        $ageHours = $concern->created_at ? max(0, now()->diffInHours($concern->created_at)) : 0;
        $ageScore = min(48, $ageHours * 2);
        $score = $severityScore + ($safetyMatches * 25) + $ageScore;

        $reason = $concern->severity
            ? ucfirst($concern->severity) . ' AI severity'
            : 'Awaiting AI severity';
        if ($safetyMatches > 0) {
            $reason .= ' + safety keyword';
        } elseif ($ageScore > 0) {
            $reason .= ' + waiting time';
        }

        return ['score' => $score, 'reason' => $reason];
    }

    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;
        $record = Concern::where('barangay_id', $barangayId)
            ->with(['media', 'currentAiAnalysis', 'mission.personnel'])
            ->findOrFail($id);
        
        $locationData = DB::selectOne("SELECT ST_X(location) as lat, ST_Y(location) as lng FROM concerns WHERE id = ?", [$record->id]);
        
        $personnelList = Personnel::with('user')
            ->whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId)
                  ->where('role', 'personnel')
                  ->where('is_active', 1);
            })
            ->get()
            ->map(function ($personnel) {
                $fullName = trim(($personnel->user?->first_name ?? '') . ' ' . ($personnel->user?->last_name ?? ''));
                return [
                    'id' => $personnel->id,
                    'name' => $fullName ?: 'Unnamed Personnel',
                    'category' => $personnel->category?->label() ?? 'Category not set',
                ];
            });

        // Pluck already assigned personnel IDs if a mission already exists for this concern
        $assignedPersonnelIds = $record->mission?->personnel?->pluck('id')->values()->toArray() ?? [];

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
                'prescriptive_steps' => $record->currentAiAnalysis?->prescriptive_steps ?? [],
                'assigned_personnel_ids' => $assignedPersonnelIds, // Passed to frontend
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
        
        $validated = $request->validate([
            'personnel_ids' => ['present', 'array'],
            'personnel_ids.*' => ['exists:personnel,id'],
            'mission_notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($concern, $validated, $barangayId, $request) {
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $barangayId,
                    'status' => 'assigned',
                    'due_date' => now()->addDays(2),
                    'created_by' => $request->user()->id,
                ]
            );

            $syncData = [];
            foreach ($validated['personnel_ids'] as $personnelId) {
                $existingPivot = DB::table('mission_personnel')
                    ->where('mission_id', $mission->id)
                    ->where('personnel_id', $personnelId)
                    ->first();

                $syncData[$personnelId] = [
                    'id' => $existingPivot ? $existingPivot->id : (string) Str::uuid(),
                    'assigned_by' => $request->user()->id,
                    'status' => 'assigned',
                    'created_at' => $existingPivot ? $existingPivot->created_at : now(),
                    'updated_at' => now(),
                ];
            }

            $mission->personnel()->sync($syncData);
            
            $concern->update(['status' => 'active']);
            
            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'ESCALATE',
                'entity_type' => 'Mission',
                'entity_id' => $mission->id,
                'metadata' => json_encode(['details' => 'Escalated report into field mission with multiple personnel assigned']),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        Notification::create([
            'user_id' => $concern->reporter_id,
            'channel' => 'in_app',
            'event_type' => 'concern_active',
            'title' => 'Concern Active',
            'body' => 'A mission has been deployed to address your report.',
            'payload' => ['concern_id' => $concern->id],
        ]);

        return redirect()->route('admin.reports.index')->with('success', 'Mission deployed.');
    }
}