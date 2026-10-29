<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\MissionProofMedia;
use App\Models\MissionResolutionPost;
use App\Models\Personnel;
use App\Models\User;
use App\Enums\MissionStatus;
use App\Enums\ConcernStatus;
use App\Jobs\SendMissionAssignmentSms;
use App\Services\Sms\SmsGatewayInterface;
use App\Services\Concerns\ConcernResolutionDeadline;
use App\Services\Missions\MissionLifecycleService;
use App\Services\Missions\MissionResolutionPostBuilder;
use App\Support\ConcernStatusUpdate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MissionController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $concerns = Concern::where('barangay_id', $barangayId)
            ->whereIn('status', ['active', 'resolved', 'in_progress'])
            ->with(['votes', 'category', 'duplicates.reporter', 'duplicateOf'])
            ->get();

        $realMissions = Mission::with('personnel.user')
            ->whereIn('concern_id', $concerns->pluck('id'))
            ->get()
            ->keyBy('concern_id');

        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $mappedMissions = $concerns->map(function ($concern) use ($realMissions, $deadlinePolicy) {
            $mission = $realMissions->get($concern->id);

            $rawId = $mission ? $mission->id : $concern->id; 

            $assigneeNames = $mission?->personnel?->map(function($p) {
                return trim(($p->user?->first_name ?? '') . ' ' . ($p->user?->last_name ?? ''));
            })->filter()->implode(', ') ?: null;

            $personnelIds = $mission?->personnel?->pluck('id')->values()->toArray() ?? [];
            $statusStr = $mission ? ($mission->status->value ?? $mission->status) : 'assigned';

            // Calculate priority score for ranking
            $severityScore = match ($concern->severity) {
                'critical' => 400,
                'high' => 300,
                'medium' => 200,
                'low' => 100,
                default => 150,
            };
            $upvotes = $concern->relationLoaded('votes') ? $concern->votes->where('vote', 1)->count() : 0;
            $mergedCount = $concern->duplicates->count();
            $duplicateBoost = $mergedCount * 10; // Boost missions that consolidate multiple resident reports
            $priorityScore = $severityScore + ($upvotes * 30) + $duplicateBoost;

            return [
                'id' => $rawId, 
                'display_id' => 'MS-' . strtoupper(substr($rawId, 0, 4)),
                'concern_id' => $concern->id,
                'concern_title' => $concern->title,
                'location' => $concern->locationLabel(),
                'assignee' => $assigneeNames,
                'personnel_ids' => $personnelIds,
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'priority_score' => $priorityScore,
                'status' => $statusStr,
                'due_date' => $mission && $mission->due_date ? $mission->due_date->format('M d, Y') : $deadlinePolicy->deadlineFor($concern)->format('M d, Y'),
                'due_date_iso' => $mission?->due_date?->toDateString(),
                'max_due_date' => $deadlinePolicy->deadlineFor($concern)->toDateString(),
                'is_overdue' => $mission ? (bool)$mission->is_overdue : false,
                'is_escalated' => $mission ? (bool)$mission->is_escalated : false,
                'merged_duplicates_count' => $mergedCount,
                'has_merged_duplicates' => $mergedCount > 0,
            ];
        })->sortByDesc('priority_score')->values();

        // Assign numerical Rank (1, 2, 3...)
        $missions = $mappedMissions->map(function ($m, $index) {
            $m['rank'] = $index + 1;
            return $m;
        });

        $counts = [
            'all' => $missions->count(),
            'assigned' => $missions->where('status', 'assigned')->count(),
            'acknowledged' => $missions->where('status', 'acknowledged')->count(),
            'in_progress' => $missions->where('status', 'in_progress')->count(),
            'completed' => $missions->where('status', 'completed')->count(),
            'verified' => $missions->where('status', 'verified')->count(),
            'overdue' => $missions->where('is_overdue', true)->where('status', '!=', 'verified')->count(),
            'merged' => $missions->where('has_merged_duplicates', true)->count(),
        ];

        User::where('barangay_id', $barangayId)
            ->where('role', 'personnel')
            ->each(function ($user) {
                Personnel::firstOrCreate(['user_id' => $user->id]);
            });

        $personnelList = Personnel::with('user')
            ->whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId)
                    ->where('role', 'personnel')
                    ->where('is_active', 1);
            })
            ->get()
            ->map(function ($personnel) {
                return [
                    'id' => $personnel->id,
                    'name' => trim(($personnel->user?->first_name ?? '') . ' ' . ($personnel->user?->last_name ?? '')),
                    'category' => $personnel->category?->label() ?? 'Category not set',
                ];
            });

        return Inertia::render('Admin/Missions/Index', [
            'missions' => $missions->values(),
            'counts' => $counts,
            'personnel' => $personnelList,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $validated = $request->validate([
            'concern_id' => ['required', 'exists:concerns,id'],
            'personnel_ids' => ['required', 'array', 'min:1'],
            'personnel_ids.*' => ['exists:personnel,id'], 
        ]);

        $barangayId = $request->user()->barangay_id;
        $concern = Concern::where('barangay_id', $barangayId)->findOrFail($validated['concern_id']);

        $deadlinePolicy = app(ConcernResolutionDeadline::class);
        $lifecycle = app(MissionLifecycleService::class);
        if (!$lifecycle->areActivePersonnelInBarangay($validated['personnel_ids'], $barangayId)) {
            return back()->withErrors(['personnel_ids' => 'Select active personnel from this barangay only.']);
        }

        $maxDueDate = $deadlinePolicy->deadlineFor($concern)->toDateString();
        $validated['due_date'] = $request->validate([
            'due_date' => ['nullable', 'date', 'before_or_equal:'.$maxDueDate],
        ], [
            'due_date.before_or_equal' => 'RA 11032 compliance: this due date exceeds the allowed resolution deadline.',
        ])['due_date'] ?? null;

        $existingMission = Mission::where('concern_id', $concern->id)->first();
        $existingStatus = $existingMission?->status->value ?? $existingMission?->status;
        if (in_array($existingStatus, ['completed', 'verified', 'cancelled'], true)) {
            return back()->withErrors(['concern_id' => 'Closed missions cannot be reassigned.']);
        }

        $newlyAssignedPersonnelIds = [];
        $missionId = null;

        DB::transaction(function () use ($validated, $concern, $request, $barangayId, $deadlinePolicy, $lifecycle, $existingMission, &$newlyAssignedPersonnelIds, &$missionId) {
            $previousStatus = $existingMission
                ? ($existingMission->status->value ?? $existingMission->status)
                : null;
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $concern->barangay_id,
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
                    'id' => $existingPivot ? $existingPivot->id : (string) \Illuminate\Support\Str::uuid(),
                    'assigned_by' => $request->user()->id,
                    'status' => 'assigned',
                    'created_at' => $existingPivot ? $existingPivot->created_at : now(),
                    'updated_at' => now(),
                ];

                $personnelRecord = Personnel::with('user')->find($personnelId);
                if ($personnelRecord && $personnelRecord->user_id) {
                    Notification::create([
                        'user_id' => $personnelRecord->user_id,
                        'barangay_id' => $barangayId,
                        'channel' => 'in_app',
                        'event_type' => 'new_mission_assigned',
                        'title' => 'New mission assigned',
                        'body' => 'MS-' . strtoupper(substr($mission->id, 0, 4)) . ' ' . $concern->title . ' — due ' . ($mission->due_date ? $mission->due_date->format('M d, Y') : 'soon') . '.',
                        'payload' => ['mission_id' => $mission->id],
                        'is_read' => false,
                    ]);
                }
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

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CREATE',
                'entity_type' => 'Mission',
                'entity_id' => $mission->id,
                'metadata' => json_encode(['details' => 'Updated personnel assignments for mission/concern: ' . $concern->title]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        foreach ($newlyAssignedPersonnelIds as $personnelId) {
            SendMissionAssignmentSms::dispatch($missionId, $personnelId);
        }

        return back()->with('success', 'Personnel assignments successfully updated!');
    }

    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;

        $mission = Mission::where('barangay_id', $barangayId)
            ->with([
                'concern.media', 
                'concern.duplicates.reporter', 
                'concern.duplicates.media',
                'proof.media', 
                'personnel.user',
                'resolutionPost',
            ])
            ->findOrFail($id);

        $concern = $mission->concern;
        $concernImages = $concern->media?->map(fn($m) => asset('storage/'.$m->storage_key))->toArray() ?? [];
        $proofPhotos = $mission->proof?->media?->map(fn($m) => asset('storage/'.$m->storage_key))->toArray() ?? [];

        $assigneeNames = $mission->personnel->map(function($p) {
            return trim(($p->user?->first_name ?? '') . ' ' . ($p->user?->last_name ?? ''));
        })->filter()->implode(', ') ?: 'Unassigned';

        $mergedDuplicates = $concern->duplicates->map(function ($dup) {
            return [
                'id' => $dup->id,
                'title' => $dup->title,
                'description' => $dup->description,
                'reporter_name' => trim(($dup->reporter?->first_name ?? '') . ' ' . ($dup->reporter?->last_name ?? '')),
                'reporter_mobile' => $dup->reporter?->mobile,
                'submitted_at' => $dup->created_at->format('M d, Y g:i A'),
                'images' => $dup->media->map(fn($m) => asset('storage/'.$m->storage_key))->values()->toArray(),
            ];
        });

        return Inertia::render('Admin/Missions/Show', [
            'mission' => [
                'id' => $mission->id,
                'concern_id' => $concern->id,
                'title' => $concern->title,
                'location' => $concern->locationLabel(),
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'status' => $mission->status->value ?? $mission->status,
                'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : null,
                'is_overdue' => (bool)$mission->is_overdue,
                'brief' => $concern->description,
                'assignee' => $assigneeNames,
                'assigned_personnel' => $mission->personnel->map(fn ($personnel) => [
                    'id' => $personnel->id,
                    'name' => trim(($personnel->user?->first_name ?? '') . ' ' . ($personnel->user?->last_name ?? '')),
                    'sms_enabled' => (bool) $personnel->sms_enabled,
                    'has_mobile' => filled($personnel->user?->mobile),
                ])->values(),
                'available_personnel' => Personnel::with('user')
                    ->whereNotIn('id', $mission->personnel->pluck('id'))
                    ->whereHas('user', fn ($query) => $query
                        ->where('barangay_id', $barangayId)
                        ->where('role', 'personnel')
                        ->where('is_active', true))
                    ->get()
                    ->map(fn ($personnel) => [
                        'id' => $personnel->id,
                        'name' => trim(($personnel->user?->first_name ?? '') . ' ' . ($personnel->user?->last_name ?? '')),
                        'category' => $personnel->category?->label() ?? 'Category not set',
                    ])->values(),
                'images' => $concernImages,
                'proof_notes' => $mission->proof?->notes,
                'proof_photos' => $proofPhotos,
                'proof_latitude' => $mission->proof?->latitude,
                'proof_longitude' => $mission->proof?->longitude,
                'proof_location_accuracy_m' => $mission->proof?->location_accuracy_m,
                'resolution_post' => $mission->resolutionPost && !$mission->resolutionPost->is_published ? [
                    'id' => $mission->resolutionPost->id,
                    'title' => $mission->resolutionPost->title,
                    'body' => $mission->resolutionPost->body,
                    'media_ids' => $mission->resolutionPost->media_ids ?? [],
                    'images' => $mission->proof?->media
                        ->whereIn('id', $mission->resolutionPost->media_ids ?? [])
                        ->map(fn ($media) => [
                            'id' => $media->id,
                            'url' => asset('storage/'.$media->storage_key),
                        ])
                        ->values()
                        ->all() ?? [],
                ] : null,
                'assigned_at' => $mission->created_at->format('M d, Y'),
                'merged_duplicates' => $mergedDuplicates,
            ],
        ]);
    }

    public function addPersonnel(Request $request, string $missionId): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify mission assignments.');
        }

        $validated = $request->validate([
            'personnel_ids' => ['required', 'array', 'min:1'],
            'personnel_ids.*' => ['required', 'string', 'exists:personnel,id'],
        ]);

        $mission = Mission::where('barangay_id', $request->user()->barangay_id)
            ->with('personnel')
            ->findOrFail($missionId);
        $status = $mission->status->value ?? $mission->status;
        if (in_array($status, ['completed', 'verified', 'cancelled'], true)) {
            return back()->with('error', 'Closed missions cannot receive additional personnel.');
        }

        $personnelIds = array_values(array_unique($validated['personnel_ids']));
        $lifecycle = app(MissionLifecycleService::class);
        if (! $lifecycle->areActivePersonnelInBarangay($personnelIds, $request->user()->barangay_id)) {
            return back()->withErrors(['personnel_ids' => 'Select active personnel from this barangay only.']);
        }

        $currentlyAssignedIds = $mission->personnel->pluck('id')->all();
        $newPersonnelIds = array_values(array_diff($personnelIds, $currentlyAssignedIds));
        if ($newPersonnelIds === []) {
            return back()->withErrors(['personnel_ids' => 'Select at least one person who is not already assigned.']);
        }

        DB::transaction(function () use ($mission, $newPersonnelIds, $request, $lifecycle) {
            $syncData = [];
            foreach ($newPersonnelIds as $personnelId) {
                $syncData[$personnelId] = [
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'assigned_by' => $request->user()->id,
                    'status' => 'assigned',
                ];
            }
            $mission->personnel()->syncWithoutDetaching($syncData);

            $newPersonnel = Personnel::with('user')->whereIn('id', $newPersonnelIds)->get();
            foreach ($newPersonnel as $personnel) {
                if ($personnel->user_id) {
                    Notification::create([
                        'user_id' => $personnel->user_id,
                        'barangay_id' => $mission->barangay_id,
                        'channel' => 'in_app',
                        'event_type' => 'new_mission_assigned',
                        'title' => 'New mission assigned',
                        'body' => 'MS-' . strtoupper(substr($mission->id, 0, 4)) . ' ' . $mission->concern->title . ' — due ' . ($mission->due_date?->format('M d, Y') ?? 'soon') . '.',
                        'payload' => ['mission_id' => $mission->id],
                        'is_read' => false,
                    ]);
                }
            }

            $lifecycle->recordAssignmentChanges($mission, [], $request->user()->id);
            DB::table('audit_logs')->insert([
                'barangay_id' => $mission->barangay_id,
                'actor_id' => $request->user()->id,
                'action' => 'ADD_MISSION_PERSONNEL',
                'entity_type' => 'Mission',
                'entity_id' => $mission->id,
                'metadata' => json_encode(['personnel_ids' => $newPersonnelIds]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        foreach ($newPersonnelIds as $personnelId) {
            SendMissionAssignmentSms::dispatch($mission->id, $personnelId);
        }

        return back()->with('success', 'Personnel added to the mission. SMS notifications were attempted.');
    }

    public function resendAssignmentSms(
        Request $request,
        string $missionId,
        string $personnelId,
        SmsGatewayInterface $smsGateway,
    ): RedirectResponse {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot send mission notifications.');
        }

        $mission = Mission::where('barangay_id', $request->user()->barangay_id)
            ->with(['personnel.user'])
            ->findOrFail($missionId);
        $personnel = $mission->personnel->firstWhere('id', $personnelId);

        if (! $personnel) {
            abort(404);
        }

        if (! $personnel->sms_enabled) {
            return back()->with('error', 'SMS is disabled for this personnel account.');
        }

        if (! $personnel->user?->mobile) {
            return back()->with('error', 'This personnel account does not have a mobile number.');
        }

        $sent = (new SendMissionAssignmentSms($mission->id, $personnel->id))->handle($smsGateway);

        return $sent
            ? back()->with('success', 'IPROG accepted the SMS resend request.')
            : back()->with('error', 'SMS could not be sent. Check the application log for the provider response.');
    }

    public function verifyMission(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;

        DB::transaction(function () use ($id, $barangayId, $request) {
            $mission = Mission::where('barangay_id', $barangayId)
                ->with(['concern.duplicates', 'personnel.user', 'assignments', 'proof.media', 'checklistItems', 'resolutionPost'])
                ->findOrFail($id);
            $previousStatus = $mission->status->value ?? $mission->status;
            if ($previousStatus !== 'completed' || !$mission->proof()->exists()) {
                abort(422, 'Only completed missions with submitted proof can be verified.');
            }

            $mission->update([
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => Auth::id(),
            ]);
            app(\App\Services\Missions\MissionLifecycleService::class)->recordStatusChange(
                $mission,
                $previousStatus,
                'verified',
                $request->user()->id,
                'Admin verified mission completion and proof.',
            );
            $concern = Concern::where('id', $mission->concern_id)->with('duplicates')->first();
            
            if ($concern) {
                $previousConcernStatus = $concern->status->value ?? $concern->status;
                $concern->update(['status' => 'resolved']);
                if ($previousConcernStatus !== 'resolved') {
                    ConcernStatusUpdate::record(
                        $concern,
                        $previousConcernStatus,
                        'resolved',
                        $request->user()->id,
                        ConcernStatusUpdate::resolutionNote($concern),
                    );
                }

                if ($concern->visibility === 'public' && !$concern->is_blotter_candidate && $mission->proof) {
                    $existingPost = $mission->resolutionPost;
                    if (!$existingPost?->is_published) {
                        $existingPost ??= new MissionResolutionPost(['mission_id' => $mission->id]);
                        $existingPost->fill(app(MissionResolutionPostBuilder::class)->build($mission, $concern));
                        $existingPost->created_by = $request->user()->id;
                        $existingPost->save();
                    }
                }
                
                Notification::create([
                    'user_id' => $concern->reporter_id,
                    'barangay_id' => $barangayId,
                    'channel' => 'in_app',
                    'event_type' => 'concern_resolved',
                    'title' => 'Concern Resolved',
                    'body' => 'Your report has been fully verified and resolved. Thank you for keeping the community safe!',
                    'payload' => ['concern_id' => $concern->id],
                    'is_read' => false,
                ]);

                // Also notify all residents whose reports were merged into this primary concern
                foreach ($concern->duplicates as $duplicateConcern) {
                    $previousDuplicateStatus = $duplicateConcern->status->value ?? $duplicateConcern->status;
                    $duplicateConcern->update(['status' => 'resolved']);
                    if ($previousDuplicateStatus !== 'resolved') {
                        ConcernStatusUpdate::record(
                            $duplicateConcern,
                            $previousDuplicateStatus,
                            'resolved',
                            $request->user()->id,
                            ConcernStatusUpdate::resolutionNote($duplicateConcern),
                        );
                    }
                    
                    Notification::create([
                        'user_id' => $duplicateConcern->reporter_id,
                        'barangay_id' => $barangayId,
                        'channel' => 'in_app',
                        'event_type' => 'concern_resolved',
                        'title' => 'Concern Resolved',
                        'body' => 'The community issue you reported ("' . $duplicateConcern->title . '") has been officially resolved through field operation MS-' . strtoupper(substr($mission->id, 0, 4)) . '.',
                        'payload' => ['concern_id' => $duplicateConcern->id],
                        'is_read' => false,
                    ]);
                }
            }

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'VERIFY',
                'entity_type' => 'Mission',
                'entity_id' => $mission->id,
                'metadata' => json_encode(['details' => 'Verified mission completion and resolved associated concern along with merged duplicate reports']),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Mission verified and concern resolved.');
    }

    public function publishResolutionPost(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot publish community updates.');
        }

        $mission = Mission::where('barangay_id', $request->user()->barangay_id)
            ->with(['concern', 'proof.media', 'resolutionPost'])
            ->findOrFail($id);

        if (
            ($mission->status->value ?? $mission->status) !== 'verified'
            || $mission->concern?->visibility !== 'public'
            || $mission->concern?->is_blotter_candidate
        ) {
            return back()->withErrors(['resolution_post' => 'Only verified missions for public reports can be posted to the community feed.']);
        }

        $post = $mission->resolutionPost;
        if (!$post || $post->is_published) {
            return back()->with('error', 'This mission has no unpublished community update.');
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'min:20', 'max:5000'],
            'media_ids' => ['required', 'array', 'min:1', 'max:5'],
            'media_ids.*' => ['required', 'uuid', 'exists:mission_proof_media,id'],
        ]);

        $selectedMediaIds = $mission->proof->media()
            ->whereIn('id', $validated['media_ids'])
            ->pluck('id')
            ->all();

        if (count($selectedMediaIds) !== count(array_unique($validated['media_ids']))) {
            return back()->withErrors(['media_ids' => 'Choose only photos submitted as proof for this mission.']);
        }

        DB::transaction(function () use ($post, $mission, $validated, $selectedMediaIds, $request) {
            $post->update([
                'title' => $validated['title'],
                'body' => $validated['body'],
                'media_ids' => $selectedMediaIds,
                'is_published' => true,
                'published_at' => now(),
                'created_by' => $request->user()->id,
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $mission->barangay_id,
                'actor_id' => $request->user()->id,
                'action' => 'PUBLISH_MISSION_RESOLUTION',
                'entity_type' => 'MissionResolutionPost',
                'entity_id' => $post->id,
                'metadata' => json_encode(['mission_id' => $mission->id, 'title' => $validated['title']]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Verified resolution published to the public community feed.');
    }

}