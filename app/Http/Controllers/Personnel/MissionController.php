<?php

namespace App\Http\Controllers\Personnel;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Models\MissionChecklistItem;
use App\Models\MissionProof;
use App\Models\MissionProofMedia;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $missionsQuery = Mission::with(['concern.media'])
            ->select('missions.*')
            ->addSelect([
                'lat' => \App\Models\Concern::selectRaw('ST_Y(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
                'lng' => \App\Models\Concern::selectRaw('ST_X(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
            ])
            ->where('assigned_to', $user->id)
            ->latest()
            ->get();

        $missions = $missionsQuery->map(function ($mission) {
            $concern = $mission->concern;
            
            $concernImages = $concern && $concern->media 
                ? $concern->media->sortBy('sort_order')->map(fn($media) => asset('storage/' . $media->storage_key))->toArray() 
                : [];

            $statusValue = $mission->status instanceof \UnitEnum ? $mission->status->value : $mission->status;

            return [
                'id' => $mission->id, 
                'concern_id' => $concern?->id,
                'title' => $concern?->title ?? 'Untitled Mission',
                'location' => $concern?->address_text ?? 'Unknown location',
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
                'proof_submitted' => $mission->relationLoaded('proof') && $mission->proof !== null,
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
        $mission = Mission::with(['concern.media', 'proof.media', 'checklistItems'])
            ->select('missions.*') 
            ->addSelect([
                'lat' => \App\Models\Concern::selectRaw('ST_Y(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
                'lng' => \App\Models\Concern::selectRaw('ST_X(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
            ])
            ->findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $concern = $mission->concern;
        $proof = $mission->proof;

        $concernImages = [];
        if ($concern && $concern->media) {
            $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
            })->toArray();
        }

        $proofPhotos = [];
        if ($proof && $proof->media) {
            $proofPhotos = $proof->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
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

        $formattedMission = [
            'id' => $mission->id,
            'concern_id' => $concern?->id,
            'title' => $concern?->title ?? 'Untitled Mission',
            'location' => $concern?->address_text ?? 'Unknown location',
            'lat' => $mission->lat, 
            'lng' => $mission->lng,
            'priority' => $concern?->severity === 'critical' ? 'high' : 'med',
            'status' => $statusValue,
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
        ];

        return Inertia::render('Personnel/Missions/Show', [
            'mission' => $formattedMission,
        ]);
    }

    public function updateStatus(Request $request, string $id): RedirectResponse
    {
        $mission = Mission::findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:acknowledged,in_progress'],
        ]);

        $updateData = ['status' => $validated['status']];

        // Automatically stamp acknowledged_at if transitioning to acknowledged for the first time
        if ($validated['status'] === 'acknowledged' && !$mission->acknowledged_at) {
            $updateData['acknowledged_at'] = now();
        }

        $mission->update($updateData);

        return back()->with('success', 'Mission status successfully updated!');
    }

    public function toggleChecklist(Request $request, string $id): RedirectResponse
    {
        $mission = Mission::findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
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
        $mission = Mission::with('concern')->findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $concern = $mission->concern;

        $formattedMission = [
            'id' => $mission->id,
            'title' => $concern?->title ?? 'Untitled Mission',
            'location' => $concern?->address_text ?? 'Unknown location',
            'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : 'No due date',
        ];

        return Inertia::render('Personnel/Missions/Proof', [
            'mission' => $formattedMission,
        ]);
    }

    public function storeProof(Request $request, string $id): RedirectResponse
    {
        $mission = Mission::with('concern')->findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'],
            'photos.*' => ['image', 'mimes:jpeg,png,jpg', 'max:5120'],
        ]);

        $proof = MissionProof::create([
            'mission_id' => $mission->id,
            'submitted_by' => $request->user()->id,
            'notes' => $validated['notes'],
        ]);

        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $filePath = $photo->store('proofs', 'public');

                MissionProofMedia::create([
                    'proof_id' => $proof->id,
                    'storage_key' => $filePath,
                    'mime_type' => $photo->getMimeType(),
                ]);
            }
        }

        $mission->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        if ($mission->concern) {
            $mission->concern->update([
                'status' => 'resolved',
            ]);
        }

        return redirect()
            ->route('personnel.missions.index')
            ->with('success', 'Incredible work! Proof uploaded and mission completed.');
    }
}