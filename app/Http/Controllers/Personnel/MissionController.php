<?php

namespace App\Http\Controllers\Personnel;

use App\Http\Controllers\Controller;
use App\Models\Mission;
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

        $missionsQuery = Mission::with('concern')
            ->where('assigned_to', $user->id)
            ->latest()
            ->get();

        $missions = $missionsQuery->map(function ($mission) {
            $concern = $mission->concern;
            
            return [
                'id' => $mission->id, // <--- FIXED: Using real UUID so links work!
                'concern_id' => $concern->id,
                'title' => $concern->title,
                'location' => $concern->address_text ?? 'Unknown location',
                'lat' => 14.5995, 
                'lng' => 120.9842,
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'status' => $mission->status->value ?? $mission->status,
                'due_date' => $mission->due_date->format('M d, Y'),
                'is_overdue' => $mission->is_overdue,
                'visibility' => $concern->visibility,
                'brief' => $concern->description,
                'checklist' => [], 
                'reporter_name' => null, 
                'reporter_phone' => null,
                'assigned_at' => $mission->created_at->format('M d, Y h:i A'),
                'proof_submitted' => false,
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
        // 1. Fetch the mission WITH the proof and the photos!
        $mission = Mission::with(['concern', 'proof.media'])->findOrFail($id);

        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $concern = $mission->concern;
        $proof = $mission->proof;

        // 2. Generate the public URLs for the images
        $proofPhotos = [];
        if ($proof && $proof->media) {
            $proofPhotos = $proof->media->map(function ($media) {
                return asset('storage/' . $media->storage_key); // Creates the localhost:8000/storage/... link
            })->toArray();
        }

        $formattedMission = [
            'id' => $mission->id,
            'concern_id' => $concern->id,
            'title' => $concern->title,
            'location' => $concern->address_text ?? 'Unknown location',
            'lat' => 14.5995, 
            'lng' => 120.9842,
            'priority' => $concern->severity === 'critical' ? 'high' : 'med',
            'status' => $mission->status->value ?? $mission->status,
            'due_date' => $mission->due_date->format('M d, Y'),
            'is_overdue' => $mission->is_overdue,
            'visibility' => $concern->visibility,
            'brief' => $concern->description,
            'checklist' => [],
            'reporter_name' => null,
            'reporter_phone' => null,
            'assigned_at' => $mission->created_at->format('M d, Y h:i A'),
            
            // --- NEW PROOF DATA FOR REACT ---
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
        // 1. Find the mission
        $mission = Mission::findOrFail($id);

        // 2. Security Check
        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        // 3. Validate that React is sending an allowed status
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:acknowledged,in_progress'],
        ]);

        // 4. Update the database!
        $mission->update([
            'status' => $validated['status'],
        ]);

        // 5. Send them back to the page with a green success banner
        return back()->with('success', 'Mission status successfully updated!');
    }
    public function proofForm(Request $request, string $id): Response
    {
        // 1. Fetch the mission
        $mission = Mission::with('concern')->findOrFail($id);

        // 2. Security Check: Only the assigned worker can upload proof
        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        $concern = $mission->concern;

        // 3. Format exactly what the Proof.tsx page needs
        $formattedMission = [
            'id' => $mission->id,
            'title' => $concern->title,
            'location' => $concern->address_text ?? 'Unknown location',
            'due_date' => $mission->due_date->format('M d, Y'),
        ];

        return Inertia::render('Personnel/Missions/Proof', [
            'mission' => $formattedMission,
        ]);
    }

    public function storeProof(Request $request, string $id): RedirectResponse
    {
        $mission = Mission::with('concern')->findOrFail($id);

        // 1. Security Check
        if ($mission->assigned_to !== $request->user()->id) {
            abort(403, 'Unauthorized.');
        }

        // 2. Validate the text notes AND the incoming photos!
        $validated = $request->validate([
            'notes' => ['required', 'string', 'max:2000'],
            'photos' => ['nullable', 'array', 'max:5'], // Max 5 photos per upload
            'photos.*' => ['image', 'mimes:jpeg,png,jpg', 'max:5120'], // Must be an image, max 5MB
        ]);

        // 3. Create the official Proof Record
        $proof = MissionProof::create([
            'mission_id' => $mission->id,
            'submitted_by' => $request->user()->id,
            'notes' => $validated['notes'],
        ]);

        // 4. THE MAGIC: Save the physical files and create the Media records!
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                // Laravel saves the file to storage/app/public/proofs and returns the path
                $filePath = $photo->store('proofs', 'public');

                // Save the text path to our database so we can find it later
                MissionProofMedia::create([
                    'proof_id' => $proof->id,
                    'storage_key' => $filePath,
                    'mime_type' => $photo->getMimeType(),
                ]);
            }
        }

        // 5. Update the Mission to 'completed'
        $mission->update([
            'status' => 'completed',
            'completed_at' => now(),
            // Notice we removed 'closed_summary' since the notes are safely in the Proof table now!
        ]);

        // 6. Update the original public Concern so the Resident knows it's fixed!
        $mission->concern->update([
            'status' => 'resolved',
        ]);

        // 7. Success!
        return redirect()
            ->route('personnel.missions.index')
            ->with('success', 'Incredible work! Proof uploaded and mission completed.');
    }
}