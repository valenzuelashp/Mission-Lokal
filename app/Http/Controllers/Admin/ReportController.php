<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Concern;
use App\Models\ConcernDuplicateLink;
use App\Models\Mission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use App\Jobs\SendMissionAssignmentSms;
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
            'submitted'    => ['under_review', 'rejected', 'spam'],
            'ai_processed' => ['under_review', 'rejected', 'spam', 'active', 'resolved'],
            'under_review' => ['active', 'in_progress', 'rejected', 'resolved', 'closed'],
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
            ->with([
                'media', 
                'category', 
                'currentAiAnalysis.suggestedCategory', 
                'currentAiAnalysis.duplicateCandidate',
                'votes', 
                'duplicates.reporter',
                'duplicateOf',
                'primaryDuplicateLinks'
            ])
            ->get();

        $reports = $concerns->map(function ($c) {
            $status = $c->status->value ?? $c->status;
            $priority = $this->priorityFor($c);

            $mergedDuplicatesCount = $c->duplicates->count();
            $isDuplicate = !empty($c->duplicate_of_id);
            $hasDuplicateCandidate = !empty($c->currentAiAnalysis?->duplicate_candidate_id);

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
                'is_duplicate' => $isDuplicate,
                'is_merged_master' => $mergedDuplicatesCount > 0,
                'merged_duplicates_count' => $mergedDuplicatesCount,
                'duplicate_of_id' => $c->duplicate_of_id,
                'duplicate_of_title' => $c->duplicateOf?->title,
                'has_duplicate_candidate' => $hasDuplicateCandidate,
                'duplicate_candidate_id' => $c->currentAiAnalysis?->duplicate_candidate_id,
                'duplicate_candidate_title' => $c->currentAiAnalysis?->duplicateCandidate?->title,
                'duplicate_similarity' => $c->currentAiAnalysis?->duplicate_similarity,
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
                'duplicates' => $reports->filter(fn ($r) => $r['is_duplicate'] || $r['is_merged_master'] || $r['has_duplicate_candidate'])->count(),
                'candidates' => $reports->where('has_duplicate_candidate', true)->where('is_duplicate', false)->count(),
                'merged' => $reports->where('is_duplicate', true)->count(),
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
        
        $upvotesCount = $concern->relationLoaded('votes') 
            ? $concern->votes->where('vote', 1)->count() 
            : $concern->votes()->where('vote', 1)->count();
        $voteBoost = $upvotesCount * 10;

        $ageHours = $concern->created_at ? max(0, now()->diffInHours($concern->created_at)) : 0;
        $ageScore = min(48, $ageHours * 2);
        $score = $severityScore + ($safetyMatches * 25) + $voteBoost + $ageScore;

        $reason = $concern->severity
            ? ucfirst($concern->severity) . ' AI severity'
            : 'Awaiting AI severity';
        if ($safetyMatches > 0) {
            $reason .= ' + safety keyword';
        } 
        if ($voteBoost > 0) {
            $reason .= ' + community upvotes';
        } elseif ($ageScore > 0) {
            $reason .= ' + waiting time';
        }

        return ['score' => $score, 'reason' => $reason];
    }

    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;
        $record = Concern::where('barangay_id', $barangayId)
            ->with([
                'media', 
                'currentAiAnalysis.duplicateCandidate.reporter', 
                'mission.personnel.user',
                'reporter',
                'duplicateOf.reporter',
                'duplicates.reporter',
                'duplicates.media',
                'primaryDuplicateLinks.linkedConcern.reporter'
            ])
            ->findOrFail($id);
        
        $currentStatus = $record->status->value ?? $record->status;
        if (in_array($currentStatus, ['submitted', 'ai_processed'])) {
            $record->update([
                'status' => 'under_review',
                'staff_reviewed_by' => Auth::id(),
                'staff_reviewed_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'REVIEW',
                'entity_type' => 'Concern',
                'entity_id' => $id,
                'metadata' => json_encode(['details' => 'Moved report to under_review upon admin inspection']),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        }
        
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
                $cat = $personnel->category;
                $catName = is_object($cat) && method_exists($cat, 'label') ? $cat->label() : (is_string($cat) ? ucfirst($cat) : 'General');
                return [
                    'id' => $personnel->id,
                    'name' => $fullName ?: 'Unnamed Personnel',
                    'category' => $catName,
                ];
            });

        $assignedPersonnelIds = $record->mission?->personnel?->pluck('id')->values()->toArray() ?? [];

        $masterCandidates = Concern::where('barangay_id', $barangayId)
            ->where('id', '!=', $id)
            ->whereNull('duplicate_of_id')
            ->whereIn('status', ['submitted', 'ai_processed', 'active', 'under_review'])
            ->select('id', 'title', 'created_at', 'address_text')
            ->get()
            ->map(fn($c) => [
                'id' => $c->id, 
                'label' => $c->title . ' (' . ($c->address_text ?? 'No address') . ' - ' . $c->created_at->format('M d') . ')'
            ]);

        $record->refresh();
        $aiAnalysis = $record->currentAiAnalysis()->with('duplicateCandidate.reporter')->first();
        $duplicateCandidate = $aiAnalysis?->duplicateCandidate;
        $duplicateReporterCount = $duplicateCandidate
            ? DB::table('concerns')
                ->leftJoin('concern_ai_analysis', function ($join) {
                    $join->on('concern_ai_analysis.concern_id', '=', 'concerns.id')
                        ->where('concern_ai_analysis.is_current', true);
                })
                ->where(function ($query) use ($duplicateCandidate) {
                    $query->where('concerns.id', $duplicateCandidate->id)
                        ->orWhere('concern_ai_analysis.duplicate_candidate_id', $duplicateCandidate->id)
                        ->orWhere('concerns.duplicate_of_id', $duplicateCandidate->id);
                })
                ->where('concerns.visibility', 'public')
                ->whereIn('concerns.status', ['ai_processed', 'under_review', 'active', 'resolved'])
                ->distinct()
                ->count('concerns.reporter_id')
            : null;

        $mergedDuplicates = $record->duplicates->map(function ($dup) {
            return [
                'id' => $dup->id,
                'title' => $dup->title,
                'description' => $dup->description,
                'reporter_name' => trim(($dup->reporter?->first_name ?? '') . ' ' . ($dup->reporter?->last_name ?? '')),
                'reporter_mobile' => $dup->reporter?->mobile,
                'status' => $dup->status->value ?? $dup->status,
                'submitted_at' => $dup->created_at->format('M d, Y g:i A'),
                'images' => $dup->media->map(fn($m) => asset('storage/' . $m->storage_key))->values()->toArray(),
            ];
        });

        $recommendedAction = $aiAnalysis?->duplicate_candidate_id ? 'merge' : 'escalate';

        return Inertia::render('Admin/Reports/Show', [
            'report' => [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'status' => $record->status->value ?? $record->status,
                'location_label' => $record->address_text ?? 'Unknown Location',
                'severity' => $record->severity ?? 'medium',
                'lat' => $locationData ? (float) $locationData->lat : 14.5173079,
                'lng' => $locationData ? (float) $locationData->lng : 120.9933811,
                'images' => $record->media->sortBy('sort_order')->map(fn($m) => asset('storage/' . $m->storage_key))->values()->toArray(),
                'prescriptive_steps' => $aiAnalysis?->prescriptive_steps ?? [],
                'assigned_personnel_ids' => !empty($assignedPersonnelIds) ? $assignedPersonnelIds : ($aiAnalysis?->suggested_personnel_ids ?? []),
                'ai_recommended_action' => $recommendedAction,
                'ai_action_reason' => $aiAnalysis?->duplicate_candidate_id 
                    ? 'AI detected a high-probability duplicate report nearby. Merging will consolidate resources.' 
                    : 'AI suggests standard operational triage and deployment.',
                'ai_duplicate_id' => $aiAnalysis?->duplicate_candidate_id,
                'ai_duplicate_title' => $duplicateCandidate?->title,
                'ai_duplicate_description' => $duplicateCandidate?->description,
                'ai_duplicate_reporter' => trim(($duplicateCandidate?->reporter?->first_name ?? '') . ' ' . ($duplicateCandidate?->reporter?->last_name ?? '')),
                'ai_duplicate_similarity' => $aiAnalysis?->duplicate_similarity,
                'ai_duplicate_reporter_count' => $duplicateReporterCount,
                'ai_dismissal_reason' => $aiAnalysis?->dismissal_reason,
                'duplicate_of_id' => $record->duplicate_of_id,
                'duplicate_of_title' => $record->duplicateOf?->title,
                'duplicate_of_reporter' => trim(($record->duplicateOf?->reporter?->first_name ?? '') . ' ' . ($record->duplicateOf?->reporter?->last_name ?? '')),
                'merged_duplicates' => $mergedDuplicates,
            ],
            'personnel' => $personnelList,
            'masterCandidates' => $masterCandidates,
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $validated = $request->validate(['status' => 'required|string']);

        if (!$this->validateTransition($concern->status->value ?? $concern->status, $validated['status'])) {
            return back()->withErrors(['status' => 'Invalid status transition.']);
        }

        $fromStatus = $concern->status->value ?? $concern->status;
        $concern->update(['status' => $validated['status'], 'staff_reviewed_by' => Auth::id()]);

        DB::table('concern_status_history')->insert([
            'concern_id' => $concern->id,
            'from_status' => $fromStatus,
            'to_status' => $validated['status'],
            'actor_id' => Auth::id(),
            'note' => 'Admin status update: ' . $validated['status'],
            'created_at' => now(),
        ]);

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
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

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

    public function confirmAiVerdict(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);

        $validated = $request->validate([
            'confirmed_action' => ['required', 'string', 'in:escalate,merge,dismiss'],
            'personnel_ids' => ['present', 'array'],
            'personnel_ids.*' => ['exists:personnel,id'],
            'master_concern_id' => ['nullable', 'string', 'exists:concerns,id'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $action = $validated['confirmed_action'];

        if ($action === 'escalate') {
            $newlyAssignedPersonnelIds = [];
            $missionId = null;

            DB::transaction(function () use ($concern, $validated, $barangayId, $request, &$newlyAssignedPersonnelIds, &$missionId) {
                $mission = Mission::updateOrCreate(
                    ['concern_id' => $concern->id],
                    [
                        'barangay_id' => $barangayId,
                        'status' => 'assigned',
                        'due_date' => now()->addDays(2),
                        'created_by' => $request->user()->id,
                    ]
                );
                $missionId = $mission->id;

                $syncData = [];
                foreach ($validated['personnel_ids'] as $personnelId) {
                    $existingPivot = DB::table('mission_personnel')
                        ->where('mission_id', $mission->id)
                        ->where('personnel_id', $personnelId)
                        ->first();

                    if (!$existingPivot) {
                        $newlyAssignedPersonnelIds[] = (string) $personnelId;
                    }

                    $syncData[$personnelId] = [
                        'id' => $existingPivot ? $existingPivot->id : (string) Str::uuid(),
                        'assigned_by' => $request->user()->id,
                        'status' => 'assigned',
                        'created_at' => $existingPivot ? $existingPivot->created_at : now(),
                        'updated_at' => now(),
                    ];
                }

                $mission->personnel()->sync($syncData);
                $concern->update(['status' => 'active', 'staff_reviewed_by' => Auth::id(), 'staff_reviewed_at' => now()]);

                DB::table('audit_logs')->insert([
                    'barangay_id' => $barangayId,
                    'actor_id' => Auth::id(),
                    'action' => 'CONFIRM_AI_ESCALATE',
                    'entity_type' => 'Mission',
                    'entity_id' => $mission->id,
                    'metadata' => json_encode(['details' => 'Confirmed AI verdict: Escalated report into field mission']),
                    'ip_address' => $request->ip(),
                    'created_at' => now(),
                ]);
            });

            foreach ($newlyAssignedPersonnelIds as $personnelId) {
                SendMissionAssignmentSms::dispatch($missionId, $personnelId);
            }

            Notification::create([
                'user_id' => $concern->reporter_id,
                'barangay_id' => $barangayId,
                'channel' => 'in_app',
                'event_type' => 'concern_active',
                'title' => 'Concern Active',
                'body' => 'A mission has been deployed to address your report based on AI triage confirmation.',
                'payload' => ['concern_id' => $concern->id],
            ]);

            return redirect()->route('admin.reports.index')->with('success', 'AI verdict confirmed: Mission deployed.');
        } 
        
        if ($action === 'merge') {
            $masterId = $validated['master_concern_id'] ?? $concern->currentAiAnalysis?->duplicate_candidate_id;

            if (!$masterId || $masterId === $concern->id) {
                return back()->withErrors(['master_concern_id' => 'A valid parent master concern must be specified.']);
            }

            $masterConcern = Concern::where('barangay_id', $barangayId)->findOrFail($masterId);

            DB::transaction(function () use ($concern, $masterConcern, $barangayId, $request) {
                $concern->update([
                    'status' => 'resolved',
                    'duplicate_of_id' => $masterConcern->id,
                    'closed_summary' => 'Merged as duplicate into parent report: ' . $masterConcern->title,
                    'staff_reviewed_by' => Auth::id(),
                    'staff_reviewed_at' => now(),
                ]);

                ConcernDuplicateLink::updateOrCreate(
                    [
                        'primary_concern_id' => $masterConcern->id,
                        'linked_concern_id' => $concern->id,
                    ],
                    [
                        'link_type' => 'merge',
                        'created_by' => Auth::id(),
                        'created_at' => now(),
                    ]
                );

                DB::table('concern_status_history')->insert([
                    'concern_id' => $concern->id,
                    'from_status' => $concern->getOriginal('status') ?? 'under_review',
                    'to_status' => 'resolved',
                    'actor_id' => Auth::id(),
                    'note' => 'Merged duplicate into master concern ID: ' . $masterConcern->id,
                    'created_at' => now(),
                ]);

                DB::table('audit_logs')->insert([
                    'barangay_id' => $barangayId,
                    'actor_id' => Auth::id(),
                    'action' => 'CONFIRM_AI_MERGE',
                    'entity_type' => 'Concern',
                    'entity_id' => $concern->id,
                    'metadata' => json_encode([
                        'details' => 'Confirmed AI verdict: Merged duplicate report into master ID ' . $masterConcern->id,
                        'master_concern_title' => $masterConcern->title,
                    ]),
                    'ip_address' => $request->ip(),
                    'created_at' => now(),
                ]);

                Notification::create([
                    'user_id' => $concern->reporter_id,
                    'barangay_id' => $barangayId,
                    'channel' => 'in_app',
                    'event_type' => 'concern_merged',
                    'title' => 'Report Grouped with Existing Concern',
                    'body' => 'Your report has been verified and combined with an ongoing community ticket: "' . $masterConcern->title . '". You will receive updates as resolution proceeds.',
                    'payload' => [
                        'concern_id' => $concern->id,
                        'master_concern_id' => $masterConcern->id,
                    ],
                ]);
            });

            return redirect()->route('admin.reports.index')->with('success', 'AI verdict confirmed: Duplicate report successfully merged into master concern.');
        }

        if ($action === 'dismiss') {
            $reason = $validated['rejection_reason'] ?? 'Dismissed by admin review.';
            $concern->update([
                'status' => 'rejected',
                'closed_summary' => $reason,
                'staff_reviewed_by' => Auth::id(),
                'staff_reviewed_at' => now(),
            ]);

            DB::table('concern_status_history')->insert([
                'concern_id' => $concern->id,
                'from_status' => $concern->getOriginal('status') ?? 'under_review',
                'to_status' => 'rejected',
                'actor_id' => Auth::id(),
                'note' => 'Dismissed/Rejected: ' . $reason,
                'created_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CONFIRM_AI_DISMISS',
                'entity_type' => 'Concern',
                'entity_id' => $id,
                'metadata' => json_encode(['details' => 'Confirmed AI verdict: Dismissed report due to: ' . $reason]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            Notification::create([
                'user_id' => $concern->reporter_id,
                'barangay_id' => $barangayId,
                'channel' => 'in_app',
                'event_type' => 'concern_rejected',
                'title' => 'Concern Rejected',
                'body' => 'Your report was dismissed: ' . $reason,
                'payload' => ['concern_id' => $concern->id],
            ]);

            return redirect()->route('admin.reports.index')->with('success', 'AI verdict confirmed: Report dismissed.');
        }

        return back()->with('error', 'Invalid action specified.');
    }

    public function mergeDuplicate(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        
        $request->validate([
            'master_concern_id' => ['required', 'string', 'exists:concerns,id'],
        ]);

        $masterConcern = Concern::where('barangay_id', $barangayId)->findOrFail($request->master_concern_id);

        if ($masterConcern->id === $concern->id) {
            return back()->withErrors(['master_concern_id' => 'Cannot merge a concern into itself.']);
        }

        DB::transaction(function () use ($concern, $masterConcern, $barangayId, $request) {
            $concern->update([
                'status' => 'resolved',
                'duplicate_of_id' => $masterConcern->id,
                'closed_summary' => 'Merged as a duplicate into: ' . $masterConcern->title,
                'staff_reviewed_by' => Auth::id(),
                'staff_reviewed_at' => now(),
            ]);

            ConcernDuplicateLink::updateOrCreate(
                [
                    'primary_concern_id' => $masterConcern->id,
                    'linked_concern_id' => $concern->id,
                ],
                [
                    'link_type' => 'merge',
                    'created_by' => Auth::id(),
                    'created_at' => now(),
                ]
            );

            DB::table('concern_status_history')->insert([
                'concern_id' => $concern->id,
                'from_status' => $concern->getOriginal('status') ?? 'under_review',
                'to_status' => 'resolved',
                'actor_id' => Auth::id(),
                'note' => 'Merged duplicate into master concern ID: ' . $masterConcern->id,
                'created_at' => now(),
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'MERGE',
                'entity_type' => 'Concern',
                'entity_id' => $concern->id,
                'metadata' => json_encode(['details' => 'Merged duplicate report into master record ID: ' . $masterConcern->id]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            Notification::create([
                'user_id' => $concern->reporter_id,
                'barangay_id' => $barangayId,
                'channel' => 'in_app',
                'event_type' => 'concern_merged',
                'title' => 'Report Grouped with Existing Concern',
                'body' => 'Your report has been verified and combined with an ongoing ticket: "' . $masterConcern->title . '".',
                'payload' => [
                    'concern_id' => $concern->id,
                    'master_concern_id' => $masterConcern->id,
                ],
            ]);
        });

        return redirect()->route('admin.reports.index')->with('success', 'Report merged successfully into master concern.');
    }

    public function rejectConcern(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        $reason = $request->rejection_reason ?? 'Rejected by administrator';

        $concern->update(['status' => 'rejected', 'closed_summary' => $reason]);
        
        DB::table('concern_status_history')->insert([
            'concern_id' => $concern->id,
            'from_status' => $concern->getOriginal('status') ?? 'under_review',
            'to_status' => 'rejected',
            'actor_id' => Auth::id(),
            'note' => 'Rejected: ' . $reason,
            'created_at' => now(),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'REJECT',
            'entity_type' => 'Concern',
            'entity_id' => $id,
            'metadata' => json_encode(['details' => 'Rejected report due to: ' . $reason]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);
        
        Notification::create([
            'user_id' => $concern->reporter_id,
            'barangay_id' => $barangayId,
            'channel' => 'in_app',
            'event_type' => 'concern_rejected',
            'title' => 'Concern Rejected',
            'body' => 'Your report was rejected: ' . $reason,
            'payload' => ['concern_id' => $concern->id],
        ]);

        return redirect()->route('admin.reports.index')->with('success', 'Rejected.');
    }

    public function createMission(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($id);
        
        $validated = $request->validate([
            'personnel_ids' => ['present', 'array'],
            'personnel_ids.*' => ['exists:personnel,id'],
            'mission_notes' => ['nullable', 'string'],
        ]);

        $newlyAssignedPersonnelIds = [];
        $missionId = null;

        DB::transaction(function () use ($concern, $validated, $barangayId, $request, &$newlyAssignedPersonnelIds, &$missionId) {
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $barangayId,
                    'status' => 'assigned',
                    'due_date' => now()->addDays(2),
                    'created_by' => $request->user()->id,
                ]
            );
            $missionId = $mission->id;

            $syncData = [];
            foreach ($validated['personnel_ids'] as $personnelId) {
                $existingPivot = DB::table('mission_personnel')
                    ->where('mission_id', $mission->id)
                    ->where('personnel_id', $personnelId)
                    ->first();

                if (!$existingPivot) {
                    $newlyAssignedPersonnelIds[] = (string) $personnelId;
                }

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

        foreach ($newlyAssignedPersonnelIds as $personnelId) {
            SendMissionAssignmentSms::dispatch($missionId, $personnelId);
        }

        Notification::create([
            'user_id' => $concern->reporter_id,
            'barangay_id' => $barangayId,
            'channel' => 'in_app',
            'event_type' => 'concern_active',
            'title' => 'Concern Active',
            'body' => 'A mission has been deployed to address your report.',
            'payload' => ['concern_id' => $concern->id],
        ]);

        return redirect()->route('admin.reports.index')->with('success', 'Mission deployed.');
    }
}