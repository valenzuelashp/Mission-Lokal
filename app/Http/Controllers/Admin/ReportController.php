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
use App\Models\ResidentProfile;
use App\Models\BarangaySetting;
use App\Support\MapHelpers;
use App\Services\Concerns\ConcernResolutionDeadline;
use App\Support\ConcernStatusUpdate;
use App\Services\Missions\MissionLifecycleService;

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

    /**
     * Helper method to assign specific Civic XP points based on Concern Category.
     */
    private function calculateCategoryXp(Concern $concern, string $barangayId): int
    {
        $concern->loadMissing('category');
        $categoryName = $concern->category ? $concern->category->name : 'Unknown';

        // Custom criteria: Define how many points each category gives.
        // You can change these numbers anytime!
        $pointsMap = [
            'Public Safety & Order'      => 20, // High priority/risk
            'Infrastructure & Utilities' => 15,
            'Sanitation & Environment'   => 10,
            'Katarungang Pambarangay'    => 5,  // Lower operational impact
        ];

        // If the category exists in our map, give those points
        if (array_key_exists($categoryName, $pointsMap)) {
            return $pointsMap[$categoryName];
        }

        // Fallback to the default settings (usually 10) if category isn't mapped
        $settings = BarangaySetting::find($barangayId);
        return $settings ? $settings->civic_xp_per_valid_report : 10;
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
                'location' => $c->locationLabel(),
                'ai_category' => $c->currentAiAnalysis?->suggestedCategory?->name
                    ?? $c->category?->name
                    ?? 'Uncategorized',
                'ai_severity' => MapHelpers::scoreFromSeverity($c->severity),
                'severity' => $c->severity ?? 'medium',
                'priority' => MapHelpers::priorityFromSeverity($c->severity),
                'priority_score' => $priority['score'],
                'priority_reason' => $priority['reason'],
                'upvotes_count' => $c->votes->where('vote', 1)->count(),
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
        
        $ageHours = $concern->created_at ? max(0, $concern->created_at->diffInHours(now())) : 0;
        $ageScore = min(48, $ageHours * 2);
        $score = $severityScore + ($safetyMatches * 25) + $ageScore;

        $reason = $concern->severity
            ? ucfirst($concern->severity) . ' AI severity'
            : 'Awaiting AI severity';
        if ($safetyMatches > 0) {
            $reason .= ' + safety keywords';
        } 
        if ($ageScore > 0) {
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
                'label' => $c->title . ' (' . $c->locationLabel() . ' - ' . $c->created_at->format('M d') . ')'
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

        // Intelligent Recommended Action based on AI confidence & duplicate match
        $isLowConfidence = ($aiAnalysis?->severity_confidence ?? 0.55) < 0.1;
        $recommendedAction = 'escalate';
        $actionReason = 'AI suggests standard operational triage and deployment.';

        if ($isLowConfidence) {
            $recommendedAction = 'dismiss';
            $actionReason = 'AI detected potential spam, gibberish, or insufficient context. Recommended for dismissal.';
        } elseif ($aiAnalysis?->duplicate_candidate_id) {
            $recommendedAction = 'merge';
            $actionReason = 'AI detected a high-probability duplicate report nearby. Merging will consolidate resources.';
        }

        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $maxDueDate = $deadlinePolicy->deadlineFor($record)->toDateString();
        $suggestedDueDate = $record->mission?->due_date?->toDateString();
        if (!$suggestedDueDate || $suggestedDueDate > $maxDueDate) {
            $suggestedDueDate = $maxDueDate;
        }

        return Inertia::render('Admin/Reports/Show', [
            'report' => [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'status' => $record->status->value ?? $record->status,
                'location_label' => $record->locationLabel(),
                'severity' => $record->severity ?? 'medium',
                'deadline_days' => $deadlinePolicy->workingDaysFor($record),
                'max_due_date' => $maxDueDate,
                'due_date' => $suggestedDueDate,
                'lat' => $locationData ? (float) $locationData->lat : 14.5173079,
                'lng' => $locationData ? (float) $locationData->lng : 120.9933811,
                'images' => $record->media->sortBy('sort_order')->map(fn($m) => asset('storage/' . $m->storage_key))->values()->toArray(),
                'prescriptive_steps' => $aiAnalysis?->prescriptive_steps ?? [],
                'assigned_personnel_ids' => !empty($assignedPersonnelIds) ? $assignedPersonnelIds : ($aiAnalysis?->suggested_personnel_ids ?? []),
                'ai_recommended_action' => $recommendedAction,
                'ai_action_reason' => $actionReason,
                'ai_duplicate_id' => $aiAnalysis?->duplicate_candidate_id,
                'ai_duplicate_title' => $duplicateCandidate?->title,
                'ai_duplicate_description' => $duplicateCandidate?->description,
                'ai_duplicate_reporter' => trim(($duplicateCandidate?->reporter?->first_name ?? '') . ' ' . ($duplicateCandidate?->reporter?->last_name ?? '')),
                'ai_duplicate_similarity' => $aiAnalysis?->duplicate_similarity,
                'ai_duplicate_reporter_count' => $duplicateReporterCount,
                'ai_dismissal_reason' => $aiAnalysis?->dismissal_reason ?? 'Flagged as spam, test input, or non-actionable gibberish.',
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
        $validated = $request->validate([
            'status' => ['required', 'string'],
            'rejection_reason' => ['required_if:status,rejected,spam', 'nullable', 'string', 'min:3', 'max:1000', 'regex:/\S/'],
        ]);

        if (!$this->validateTransition($concern->status->value ?? $concern->status, $validated['status'])) {
            return back()->withErrors(['status' => 'Invalid status transition.']);
        }

        if ($validated['status'] === 'active' && ! $concern->mission()->exists()) {
            return back()->withErrors(['status' => 'Create and assign a mission before marking this report active.']);
        }

        $fromStatus = $concern->status->value ?? $concern->status;
        $attributes = ['status' => $validated['status'], 'staff_reviewed_by' => Auth::id()];
        
        if (in_array($validated['status'], ['rejected', 'spam'], true)) {
            $attributes['closed_summary'] = $validated['rejection_reason'];
            
            // Deduct XP: -15 for spam, -10 for standard rejection
            $penalty = $validated['status'] === 'spam' ? 15 : 10;
            $reporterProfile = ResidentProfile::where('user_id', $concern->reporter_id)->first();
            if ($reporterProfile) {
                $reporterProfile->penalize('report_' . $validated['status'], $penalty, 'concern', $concern->id, $barangayId);
            }
        }
        
        $concern->update($attributes);

        DB::table('concern_status_history')->insert([
            'concern_id' => $concern->id,
            'from_status' => $fromStatus,
            'to_status' => $validated['status'],
            'actor_id' => Auth::id(),
            'note' => in_array($validated['status'], ['rejected', 'spam'], true)
                ? 'Rejected: ' . $validated['rejection_reason']
                : 'Admin status update: ' . $validated['status'],
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
        $previousStatus = $concern->status->value ?? $concern->status;
        $concern->update(['status' => 'under_review']); 

        if ($previousStatus !== 'under_review') {
            ConcernStatusUpdate::record(
                $concern,
                $previousStatus,
                'under_review',
                Auth::id(),
                'Barangay verified the concern for review.',
            );
        }

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
        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $maxDueDate = $deadlinePolicy->deadlineFor($concern)->toDateString();

        $validated = $request->validate([
            'confirmed_action' => ['required', 'string', 'in:escalate,merge,dismiss'],
            'personnel_ids' => ['present', 'array'],
            'personnel_ids.*' => ['exists:personnel,id'],
            'master_concern_id' => ['nullable', 'string', 'exists:concerns,id'],
            'rejection_reason' => ['required_if:confirmed_action,dismiss', 'nullable', 'string', 'min:3', 'max:1000', 'regex:/\S/'],
            'due_date' => ['nullable', 'date', 'before_or_equal:'.$maxDueDate],
        ], [
            'due_date.before_or_equal' => 'RA 11032 compliance: this due date exceeds the allowed resolution deadline.',
        ]);

        $action = $validated['confirmed_action'];

        if ($action === 'escalate') {
            if ($validated['personnel_ids'] === []) {
                return back()->withErrors(['personnel_ids' => 'Assign at least one personnel member before deploying a mission.']);
            }

            $newlyAssignedPersonnelIds = [];
            $missionId = null;
            $lifecycle = app(MissionLifecycleService::class);
            if (!$lifecycle->areActivePersonnelInBarangay($validated['personnel_ids'], $barangayId)) {
                return back()->withErrors(['personnel_ids' => 'Select active personnel from this barangay only.']);
            }

            DB::transaction(function () use ($concern, $validated, $barangayId, $request, $deadlinePolicy, $lifecycle, &$newlyAssignedPersonnelIds, &$missionId) {
                $previousConcernStatus = $concern->status->value ?? $concern->status;
                $existingMission = Mission::where('concern_id', $concern->id)->first();
                $previousStatus = $existingMission
                    ? ($existingMission->status->value ?? $existingMission->status)
                    : null;
                $mission = Mission::updateOrCreate(
                    ['concern_id' => $concern->id],
                    [
                        'barangay_id' => $barangayId,
                        'status' => $previousStatus ?? 'assigned',
                        'due_date' => $validated['due_date'] ?? $deadlinePolicy->deadlineFor($concern)->toDateString(),
                        'acknowledged_at' => $existingMission?->acknowledged_at,
                        'is_escalated' => $existingMission?->is_escalated ?? false,
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

                $assignmentChanges = $mission->personnel()->sync($syncData);
                $hasNewAssignments = $assignmentChanges['attached'] !== [];

                if ($hasNewAssignments) {
                    $mission->update([
                        'status' => 'assigned',
                        'acknowledged_at' => null,
                        'is_escalated' => false,
                    ]);
                }

                $lifecycle->recordAssignmentChanges(
                    $mission,
                    $assignmentChanges['detached'],
                    $request->user()->id,
                );
                $lifecycle->ensureChecklist($mission, $concern);

                if ($previousStatus !== 'assigned' && ($previousStatus === null || $hasNewAssignments)) {
                    $lifecycle->recordStatusChange($mission, $previousStatus, 'assigned', $request->user()->id, 'Admin assigned or reassigned personnel.');
                }
                $concern->update(['status' => 'active', 'staff_reviewed_by' => Auth::id(), 'staff_reviewed_at' => now()]);
                if ($previousConcernStatus !== 'active') {
                    ConcernStatusUpdate::record(
                        $concern,
                        $previousConcernStatus,
                        'active',
                        $request->user()->id,
                        'A response mission was assigned to this concern.',
                    );

                    // ==========================================
                    // DYNAMIC CATEGORY-BASED CIVIC XP
                    // ==========================================
                    $points = $this->calculateCategoryXp($concern, $barangayId);
                    
                    $reporterProfile = ResidentProfile::where('user_id', $concern->reporter_id)->first();
                    if ($reporterProfile) {
                        $reporterProfile->awardXp('valid_report', $points, 'concern', $concern->id, $barangayId);
                    }
                    // ==========================================
                }

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

            // Deduct -10 XP for AI-confirmed dismissal/spam
            $reporterProfile = ResidentProfile::where('user_id', $concern->reporter_id)->first();
            if ($reporterProfile) {
                $reporterProfile->penalize('report_dismissed', 10, 'concern', $concern->id, $barangayId);
            }

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
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'min:3', 'max:1000', 'regex:/\S/'],
        ]);
        $reason = $validated['rejection_reason'];

        $concern->update(['status' => 'rejected', 'closed_summary' => $reason]);
        
        // Deduct -10 XP for direct rejection
        $reporterProfile = ResidentProfile::where('user_id', $concern->reporter_id)->first();
        if ($reporterProfile) {
            $reporterProfile->penalize('report_rejected', 10, 'concern', $concern->id, $barangayId);
        }

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
        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $maxDueDate = $deadlinePolicy->deadlineFor($concern)->toDateString();
        
        $validated = $request->validate([
            'personnel_ids' => ['required', 'array', 'min:1'],
            'personnel_ids.*' => ['exists:personnel,id'],
            'mission_notes' => ['nullable', 'string'],
            'due_date' => ['nullable', 'date', 'before_or_equal:'.$maxDueDate],
        ], [
            'due_date.before_or_equal' => 'RA 11032 compliance: this due date exceeds the allowed resolution deadline.',
        ]);

        $newlyAssignedPersonnelIds = [];
        $missionId = null;
        $lifecycle = app(MissionLifecycleService::class);
        if (!$lifecycle->areActivePersonnelInBarangay($validated['personnel_ids'], $barangayId)) {
            return back()->withErrors(['personnel_ids' => 'Select active personnel from this barangay only.']);
        }

        DB::transaction(function () use ($concern, $validated, $barangayId, $request, $deadlinePolicy, $lifecycle, &$newlyAssignedPersonnelIds, &$missionId) {
            $previousConcernStatus = $concern->status->value ?? $concern->status;
            $existingMission = Mission::where('concern_id', $concern->id)->first();
            $previousStatus = $existingMission
                ? ($existingMission->status->value ?? $existingMission->status)
                : null;
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $barangayId,
                    'status' => $previousStatus ?? 'assigned',
                    'due_date' => $validated['due_date'] ?? $deadlinePolicy->deadlineFor($concern)->toDateString(),
                    'acknowledged_at' => $existingMission?->acknowledged_at,
                    'is_escalated' => $existingMission?->is_escalated ?? false,
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

            $assignmentChanges = $mission->personnel()->sync($syncData);
            $hasNewAssignments = $assignmentChanges['attached'] !== [];

            if ($hasNewAssignments) {
                $mission->update([
                    'status' => 'assigned',
                    'acknowledged_at' => null,
                    'is_escalated' => false,
                ]);
            }

            $lifecycle->recordAssignmentChanges(
                $mission,
                $assignmentChanges['detached'],
                $request->user()->id,
            );
            $lifecycle->ensureChecklist($mission, $concern);

            if ($previousStatus !== 'assigned' && ($previousStatus === null || $hasNewAssignments)) {
                $lifecycle->recordStatusChange($mission, $previousStatus, 'assigned', $request->user()->id, 'Admin assigned or reassigned personnel.');
            }
            
            $concern->update(['status' => 'active']);
            if ($previousConcernStatus !== 'active') {
                ConcernStatusUpdate::record(
                    $concern,
                    $previousConcernStatus,
                    'active',
                    $request->user()->id,
                    'A response mission was assigned to this concern.',
                );

                // ==========================================
                // DYNAMIC CATEGORY-BASED CIVIC XP
                // ==========================================
                $points = $this->calculateCategoryXp($concern, $barangayId);
                
                $reporterProfile = ResidentProfile::where('user_id', $concern->reporter_id)->first();
                if ($reporterProfile) {
                    $reporterProfile->awardXp('valid_report', $points, 'concern', $concern->id, $barangayId);
                }
                // ==========================================
            }
            
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