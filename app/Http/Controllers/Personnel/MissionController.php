<?php

namespace App\Http\Controllers\Personnel;

use App\Http\Controllers\Controller;
use App\Enums\PersonnelShift;
use App\Jobs\SendMissionAssignmentSms;
use App\Models\Notification;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\Personnel;
use App\Models\MissionChecklistItem;
use App\Models\MissionProof;
use App\Models\MissionProofMedia;
use App\Services\Missions\MissionLifecycleService;
use App\Services\Missions\DepartmentMissionAccess;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    private function getPersonnelRecord(Request $request)
    {
        $user = $request->user();
        
        $personnel = Personnel::where('user_id', $user->id)->first();

        if (!$personnel) {
            $personnel = Personnel::find($user->id);
        }

        return $personnel;
    }

    public function index(Request $request): Response
    {
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            return Inertia::render('Personnel/Missions/Index', [
                'missions' => [],
                'counts' => ['all' => 0, 'active' => 0, 'in_progress' => 0, 'completed' => 0, 'overdue' => 0],
            ]);
        }

        $access = app(DepartmentMissionAccess::class);
        $missionsQuery = $access->departmentQueue($personnel)
            ->select('missions.*')
            ->addSelect([
                'lat' => \App\Models\Concern::selectRaw('ST_X(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
                'lng' => \App\Models\Concern::selectRaw('ST_Y(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
            ])
            ->latest()
            ->get();

        $missions = $missionsQuery
            ->filter(fn (Mission $mission) => $access->canView($personnel, $mission))
            ->map(function ($mission) use ($personnel) {
            $concern = $mission->concern;
            
            $concernImages = $concern && $concern->media 
                ? $concern->media->sortBy('sort_order')->map(fn($media) => app(\App\Support\SensitiveMediaUrl::class)->forConcern($concern, $media))->toArray() 
                : [];

            $statusValue = $mission->status instanceof \UnitEnum ? $mission->status->value : $mission->status;

            return [
                'id' => $mission->id, 
                'concern_id' => $concern?->id,
                'title' => $concern?->title ?? 'Untitled Mission',
                'location' => $concern?->locationLabel() ?? 'Unknown location',
                'images' => $concernImages,
                'lat' => $mission->lat,
                'lng' => $mission->lng,
                'priority' => $concern?->severity === 'critical' ? 'high' : 'med',
                'status' => $statusValue,
                'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : 'No due date',
                'is_overdue' => (bool) $mission->is_overdue,
                'visibility' => $concern?->visibility ?? 'public',
                'brief' => $concern?->description ?? '',
                'checklist' => [], 
                'reporter_name' => null, 
                'reporter_phone' => null,
                'assigned_at' => $mission->created_at->format('M d, Y h:i A'),
                'proof_submitted' => $mission->proof !== null,
                'is_assigned' => $mission->personnel->contains('id', $personnel->id),
            ];
        });

        $counts = [
            'all' => $missions->count(),
            'active' => $missions->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])->count(),
            'in_progress' => $missions->where('status', 'in_progress')->count(),
            'completed' => $missions->whereIn('status', ['completed', 'verified'])->count(),
            'overdue' => $missions->where('is_overdue', true)->count(),
        ];

        return Inertia::render('Personnel/Missions/Index', [
            'missions' => $missions->values(),
            'counts' => $counts,
        ]);
    }

    public function show(Request $request, string $id): Response
    {
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $mission = Mission::with(['concern.media', 'concern.subcategory', 'proof.media', 'checklistItems', 'personnel'])
            ->select('missions.*') 
            ->addSelect([
                'lat' => \App\Models\Concern::selectRaw('ST_X(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
                'lng' => \App\Models\Concern::selectRaw('ST_Y(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
            ])
            ->findOrFail($id);
        app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

        $isAssigned = $mission->personnel->contains('id', $personnel->id);
        if ($isAssigned) {
            app(MissionLifecycleService::class)->ensureChecklist($mission, $mission->concern);
        }
        $mission->load('checklistItems');

        $concern = $mission->concern;
        $proof = $mission->proof;

        $concernImages = [];
        if ($concern && $concern->media) {
            $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                return app(\App\Support\SensitiveMediaUrl::class)->forConcern($concern, $media);
            })->toArray();
        }

        $proofPhotos = [];
        if ($proof && $proof->media) {
            $proofPhotos = $proof->media->sortBy('sort_order')->map(function ($media) {
                return app(\App\Support\SensitiveMediaUrl::class)->forProof($mission, $media);
            })->toArray();
        }

        $checklist = $mission->checklistItems->sortBy('step_order')->map(function ($item) {
            return [
                'id' => $item->id,
                'label' => $item->description,
                'done' => (bool) $item->is_completed,
            ];
        })->values()->toArray();

        $statusValue = $mission->status instanceof \UnitEnum ? $mission->status->value : $mission->status;
        $nextShift = $personnel->hasShiftSchedule()
            ? PersonnelShift::tryFrom($personnel->shift ?? '')?->next()
            : null;
        $canTurnover = $isAssigned
            && $nextShift !== null
            && $personnel->is_active
            && ! in_array($statusValue, ['completed', 'verified', 'cancelled'], true);
        $turnoverCandidates = $canTurnover
            ? Personnel::with('user')
                ->where('role', 'tanod')
                ->whereIn('department', ['peace_order', 'Peace & Order'])
                ->where('shift', $nextShift->value)
                ->where('is_active', true)
                ->where('id', '!=', $personnel->id)
                ->whereDoesntHave('missions', fn ($query) => $query->where('missions.id', $mission->id))
                ->whereHas('user', fn ($query) => $query
                    ->where('barangay_id', $request->user()->barangay_id)
                    ->where('role', 'personnel')
                    ->where('is_active', true))
                ->get()
                ->map(fn (Personnel $candidate) => [
                    'id' => $candidate->id,
                    'name' => trim(($candidate->user?->first_name ?? '') . ' ' . ($candidate->user?->last_name ?? '')),
                ])
                ->values()
            : collect();

        $assignmentAcknowledged = $mission->assignments()
            ->where('personnel_id', $request->user()->id)
            ->whereNull('unassigned_at')
            ->whereNotNull('acknowledged_at')
            ->exists();
        if (!$assignmentAcknowledged) {
            $assignmentAcknowledged = DB::table('mission_personnel')
                ->where('mission_id', $mission->id)
                ->where('personnel_id', $personnel->id)
                ->whereIn('status', ['acknowledged', 'in_progress'])
                ->exists();
        }

        $formattedMission = [
            'id' => $mission->id,
            'concern_id' => $concern?->id,
            'title' => $concern?->title ?? 'Untitled Mission',
            'location' => $concern?->locationLabel() ?? 'Unknown location',
            'lat' => $mission->lat, 
            'lng' => $mission->lng,
            'priority' => $concern?->severity === 'critical' ? 'high' : 'med',
            'status' => $statusValue,
            'assignment_acknowledged' => $assignmentAcknowledged,
            'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : null,
            'is_overdue' => (bool) $mission->is_overdue,
            'visibility' => $concern?->visibility ?? 'public',
            'brief' => $concern?->description ?? '',
            'checklist' => $checklist,
            'reporter_name' => null,
            'reporter_phone' => null,
            'assigned_at' => $mission->created_at->format('M d, Y h:i A'),
            'images' => $concernImages,
            'proof_submitted' => $proof !== null,
            'proof_notes' => $proof?->notes,
            'proof_photos' => $proofPhotos,
            'is_assigned' => $isAssigned,
            'can_turnover' => $canTurnover,
            'next_shift_label' => $nextShift?->label(),
            'turnover_candidates' => $turnoverCandidates,
        ];

        return Inertia::render('Personnel/Missions/Show', [
            'mission' => $formattedMission,
        ]);
    }

    public function turnover(Request $request, string $id): RedirectResponse
    {
        $personnel = $this->getPersonnelRecord($request);
        if (! $personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $validated = $request->validate([
            'personnel_id' => ['required', 'string', 'exists:personnel,id'],
        ]);

        $missionId = $id;
        $barangayId = $request->user()->barangay_id;
        $recipientId = null;

        DB::transaction(function () use ($request, $personnel, $validated, $missionId, $barangayId, &$recipientId) {
            $mission = Mission::where('barangay_id', $barangayId)
                ->lockForUpdate()
                ->findOrFail($missionId);
            $mission->load('concern.subcategory');

            app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

            $currentPersonnel = Personnel::with('user')->lockForUpdate()->findOrFail($personnel->id);
            if (! $currentPersonnel->hasShiftSchedule() || ! $currentPersonnel->is_active) {
                abort(403, 'Only active Peace & Order Tanods can turn over missions.');
            }

            $currentShift = PersonnelShift::tryFrom($currentPersonnel->shift ?? '');
            if (! $currentShift) {
                throw ValidationException::withMessages([
                    'personnel_id' => 'Assign this Tanod to a shift before turning over a mission.',
                ]);
            }

            $missionStatus = $mission->status instanceof \UnitEnum ? $mission->status->value : $mission->status;
            if (in_array($missionStatus, ['completed', 'verified', 'cancelled'], true)) {
                throw ValidationException::withMessages([
                    'personnel_id' => 'Closed missions cannot be turned over.',
                ]);
            }

            $currentAssignment = DB::table('mission_personnel')
                ->where('mission_id', $mission->id)
                ->where('personnel_id', $currentPersonnel->id)
                ->lockForUpdate()
                ->first();

            if (! $currentAssignment) {
                abort(403, 'Only a Tanod currently assigned to this mission can turn it over.');
            }

            $recipient = Personnel::with('user')
                ->whereKey($validated['personnel_id'])
                ->where('role', 'tanod')
                ->whereIn('department', ['peace_order', 'Peace & Order'])
                ->where('shift', $currentShift->next()->value)
                ->where('is_active', true)
                ->where('id', '!=', $currentPersonnel->id)
                ->whereDoesntHave('missions', fn ($query) => $query->where('missions.id', $mission->id))
                ->whereHas('user', fn ($query) => $query
                    ->where('barangay_id', $barangayId)
                    ->where('role', 'personnel')
                    ->where('is_active', true))
                ->lockForUpdate()
                ->first();

            if (! $recipient || ! $recipient->user) {
                throw ValidationException::withMessages([
                    'personnel_id' => 'Choose an active Peace & Order Tanod assigned to the next shift.',
                ]);
            }

            DB::table('mission_personnel')
                ->where('mission_id', $mission->id)
                ->where('personnel_id', $currentPersonnel->id)
                ->delete();

            DB::table('mission_personnel')->insert([
                'id' => (string) Str::uuid(),
                'mission_id' => $mission->id,
                'personnel_id' => $recipient->id,
                'assigned_by' => $request->user()->id,
                'status' => 'assigned',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $mission->unsetRelation('personnel');
            app(MissionLifecycleService::class)->recordAssignmentChanges(
                $mission,
                [$currentPersonnel->id],
                $request->user()->id,
            );

            $missionLabel = 'MS-' . strtoupper(substr($mission->id, 0, 4));
            $concernTitle = $mission->concern?->title ?? 'Mission';
            $isConfidential = $mission->concern
                && ($mission->concern->visibility === 'private' || $mission->concern->isSensitiveConcern());
            $currentName = trim(($currentPersonnel->user->first_name ?? '') . ' ' . ($currentPersonnel->user->last_name ?? ''));
            $recipientName = trim(($recipient->user->first_name ?? '') . ' ' . ($recipient->user->last_name ?? ''));

            Notification::create([
                'user_id' => $currentPersonnel->user_id,
                'channel' => 'in_app',
                'event_type' => 'mission_turned_over',
                'title' => 'Mission handed over',
                'body' => $isConfidential
                    ? 'A confidential mission was handed over to the next shift.'
                    : "{$missionLabel} {$concernTitle} was handed over to {$recipientName} for the next shift.",
                'payload' => ['mission_id' => $mission->id],
                'is_read' => false,
                'sent_at' => now(),
            ]);

            Notification::create([
                'user_id' => $recipient->user_id,
                'channel' => 'in_app',
                'event_type' => 'mission_turnover_assigned',
                'title' => 'Mission received for your shift',
                'body' => $isConfidential
                    ? 'A confidential mission is ready for your shift. Sign in to view details.'
                    : "{$missionLabel} {$concernTitle} was handed over by {$currentName} for your " . $currentShift->next()->label() . '.',
                'payload' => ['mission_id' => $mission->id],
                'is_read' => false,
                'sent_at' => now(),
            ]);

            $recipientId = $recipient->id;
        });

        if ($recipientId) {
            SendMissionAssignmentSms::dispatch($missionId, $recipientId);
        }

        return back()->with('success', 'Mission successfully turned over to the next-shift Tanod.');
    }

    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $mission = Mission::whereHas('personnel', function ($query) use ($personnel) {
            $query->where('personnel.id', $personnel->id);
        })->findOrFail($id);
        app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:acknowledged,in_progress'],
        ]);

        $currentStatus = $mission->status->value ?? $mission->status;
        $assignment = MissionAssignment::where('mission_id', $mission->id)
            ->where('personnel_id', $request->user()->id)
            ->whereNull('unassigned_at')
            ->latest('assigned_at')
            ->first();
        $pivotStatus = DB::table('mission_personnel')
            ->where('mission_id', $mission->id)
            ->where('personnel_id', $personnel->id)
            ->value('status');

        if ($validated['status'] === 'acknowledged' && !in_array($currentStatus, ['assigned', 'acknowledged', 'in_progress'], true)) {
            return back()->withErrors(['status' => 'This mission is no longer awaiting personnel acknowledgment.']);
        }

        if ($validated['status'] === 'in_progress' && (
            $currentStatus !== 'acknowledged'
            || ($assignment && !$assignment->acknowledged_at)
            || (!$assignment && !in_array($pivotStatus, ['acknowledged', 'in_progress'], true))
        )) {
            return back()->withErrors(['status' => 'Acknowledge the assignment before starting work, and follow the mission status sequence.']);
        }

        $missionStatus = $validated['status'] === 'acknowledged' && in_array($currentStatus, ['acknowledged', 'in_progress'], true)
            ? $currentStatus
            : $validated['status'];
        $updateData = ['status' => $missionStatus];

        if ($validated['status'] === 'acknowledged' && !$mission->acknowledged_at) {
            $updateData['acknowledged_at'] = now();
        }

        DB::transaction(function () use ($mission, $personnel, $request, $validated, $updateData, $currentStatus, $missionStatus) {
            $mission->update($updateData);

            DB::table('mission_personnel')
                ->where('mission_id', $mission->id)
                ->where('personnel_id', $personnel->id)
                ->update([
                    'status' => $validated['status'],
                    'acknowledged_at' => $validated['status'] === 'acknowledged' ? now() : DB::raw('acknowledged_at'),
                    'updated_at' => now(),
                ]);

            if ($validated['status'] === 'acknowledged') {
                DB::table('mission_assignments')
                    ->where('mission_id', $mission->id)
                    ->where('personnel_id', $request->user()->id)
                    ->whereNull('unassigned_at')
                    ->update(['acknowledged_at' => now()]);
            }

            app(MissionLifecycleService::class)->recordStatusChange(
                $mission,
                $currentStatus,
                $missionStatus,
                $request->user()->id,
                $validated['status'] === 'acknowledged' ? 'Personnel acknowledged assignment.' : 'Personnel started field work.',
            );
        });

        return back()->with('success', 'Mission status successfully updated!');
    }

    public function toggleChecklist(Request $request, string $id): RedirectResponse
    {
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $mission = Mission::whereHas('personnel', function ($query) use ($personnel) {
            $query->where('personnel.id', $personnel->id);
        })->findOrFail($id);
        app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

        $assignment = MissionAssignment::query()
            ->where('mission_id', $mission->id)
            ->where('personnel_id', $request->user()->id)
            ->whereNull('unassigned_at')
            ->latest('assigned_at')
            ->first();
        $pivotStatus = DB::table('mission_personnel')
            ->where('mission_id', $mission->id)
            ->where('personnel_id', $personnel->id)
            ->value('status');
        $assignmentAcknowledged = ($assignment && $assignment->acknowledged_at)
            || in_array($pivotStatus, ['acknowledged', 'in_progress'], true);

        if (!$assignmentAcknowledged) {
            return back()->with('error', 'Acknowledge the assignment before updating its checklist.');
        }

        if (($mission->status->value ?? $mission->status) !== 'in_progress') {
            return back()->with('error', 'Start Field Work before updating the checklist.');
        }

        $validated = $request->validate([
            'item_id' => ['required', 'string', 'exists:mission_checklist_items,id'],
        ]);

        $checklistItem = MissionChecklistItem::where('mission_id', $mission->id)
            ->where('id', $validated['item_id'])
            ->firstOrFail();

        $newState = !$checklistItem->is_completed;

        $checklistItem->update([
            'is_completed' => $newState,
            'completed_at' => $newState ? now() : null,
            'completed_by' => $newState ? $request->user()->id : null,
        ]);

        return back();
    }

    public function proofForm(Request $request, string $id): Response
    {
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $mission = Mission::with('concern')->whereHas('personnel', function ($query) use ($personnel) {
            $query->where('personnel.id', $personnel->id);
        })->findOrFail($id);
        app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

        $concern = $mission->concern;

        $formattedMission = [
            'id' => $mission->id,
            'title' => $concern?->title ?? 'Untitled Mission',
            'location' => $concern?->locationLabel() ?? 'Unknown location',
            'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : 'No due date',
        ];

        return Inertia::render('Personnel/Missions/Proof', [
            'mission' => $formattedMission,
        ]);
    }

    public function storeProof(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();
        $personnel = $this->getPersonnelRecord($request);

        if (!$personnel) {
            abort(403, 'Unauthorized personnel account context.');
        }

        $mission = Mission::with('concern')->whereHas('personnel', function ($query) use ($personnel) {
            $query->where('personnel.id', $personnel->id);
        })->findOrFail($id);
        app(DepartmentMissionAccess::class)->assertCanView($personnel, $mission);

        app(MissionLifecycleService::class)->ensureChecklist($mission, $mission->concern);
        $checklistItems = $mission->checklistItems()->get();
        if ($checklistItems->isEmpty() || $checklistItems->contains(fn ($item) => !$item->is_completed)) {
            return back()->withErrors(['checklist' => 'Complete every prescribed checklist step before submitting proof.']);
        }

        if (($mission->status->value ?? $mission->status) !== 'in_progress') {
            return back()->withErrors(['status' => 'Only an in-progress mission can be completed with proof.']);
        }

        $validated = $request->validate([
            'notes' => ['required', 'string', 'min:20', 'max:2000'],
            'photos' => ['required', 'array', 'min:1', 'max:5'],
            'photos.*' => ['required', 'image', 'mimes:jpeg,png,jpg', 'dimensions:min_width=720,min_height=480', 'max:5120'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_accuracy_m' => ['required', 'numeric', 'min:0'],
        ]);

        $previousStatus = $mission->status->value ?? $mission->status;
        DB::transaction(function () use ($request, $mission, $user, $validated, $previousStatus) {
            $proof = MissionProof::create([
                'mission_id' => $mission->id,
                'submitted_by' => $user->id,
                'notes' => $validated['notes'],
                'latitude' => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'location_accuracy_m' => $validated['location_accuracy_m'],
            ]);

            foreach ($request->file('photos') as $photo) {
                $filePath = $photo->store('proofs', 'local');

                MissionProofMedia::create([
                    'proof_id' => $proof->id,
                    'storage_key' => $filePath,
                    'mime_type' => $photo->getMimeType(),
                ]);
            }

            $mission->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
            app(MissionLifecycleService::class)->recordStatusChange(
                $mission,
                $previousStatus,
                'completed',
                $user->id,
                'Personnel submitted geotagged photo proof and completed all checklist steps.',
            );
        });

        Notification::create([
            'user_id' => $mission->created_by,
            'channel' => 'in_app',
            'event_type' => 'proof_uploaded',
            'title' => 'New Proof Uploaded',
            'body' => 'Personnel has submitted proof for mission ' . substr($mission->id, 0, 8) . '.',
            'payload' => ['mission_id' => $mission->id],
        ]);

        return redirect()
            ->route('personnel.missions.index')
            ->with('success', 'Incredible work! Proof uploaded and mission completed.');
    }
}