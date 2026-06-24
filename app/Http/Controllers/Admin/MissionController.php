<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function index(): Response
    {
        // 1. Fetch all active and resolved concerns
        $concerns = Concern::whereIn('status', ['active', 'resolved'])
            ->latest()
            ->get();

        // 2. Fetch all REAL missions that exist for these concerns
        $realMissions = Mission::with('assignee')
            ->whereIn('concern_id', $concerns->pluck('id'))
            ->get()
            ->keyBy('concern_id');

        // 3. Map them together for the React UI!
        $missions = $concerns->map(function ($concern) use ($realMissions) {
            
            // Check if a mission has actually been created for this concern
            $mission = $realMissions->get($concern->id);

            return [
                // 1. Pass the REAL ID for the link (if a mission exists)
                'raw_mission_id' => $mission ? $mission->id : null,
                
                // 2. Keep the PRETTY ID for the text
                'id' => $mission ? 'MS-' . strtoupper(substr($mission->id, 0, 4)) : 'MS-' . strtoupper(substr($concern->id, 0, 4)),
                'concern_id' => $concern->id,
                'concern_title' => $concern->title,
                'location' => $concern->address_text ?? 'Unknown location',
                
                // Magic: Pull the real assigned worker's name!
                'assignee' => $mission?->assignee?->full_name ?? $mission?->assignee?->account_id ?? null,
                
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                
                // Use the real mission status, or default to 'assigned' so the UI knows it needs assignment
                'status' => $mission ? ($mission->status->value ?? $mission->status) : 'assigned',
                
                'due_date' => $mission ? $mission->due_date->format('M d, Y') : $concern->created_at->addDays(2)->format('M d, Y'),
                'is_overdue' => $mission ? $mission->is_overdue : false,
                'is_escalated' => $mission ? $mission->is_escalated : false,
            ];
        });

        $counts = [
            'all' => $missions->count(),
            'assigned' => $missions->where('status', 'assigned')->count(),
            'acknowledged' => $missions->where('status', 'acknowledged')->count(),
            'in_progress' => $missions->where('status', 'in_progress')->count(),
            'completed' => $missions->where('status', 'completed')->count(),
            'verified' => $missions->where('status', 'verified')->count(),
            'overdue' => $missions->where('is_overdue', true)->count(),
        ];

        // Fetch the Personnel Roster
        $personnelList = User::where('role', 'personnel')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name ?? $user->account_id,
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
        $validated = $request->validate([
            'concern_id' => ['required', 'exists:concerns,id'],
            'assigned_to' => ['required', 'exists:users,id'],
        ]);

        $concern = Concern::findOrFail($validated['concern_id']);

        // Safely create the Mission!
        Mission::create([
            'barangay_id' => $concern->barangay_id,
            'concern_id' => $concern->id,
            'assigned_to' => $validated['assigned_to'],
            'status' => 'assigned',
            'due_date' => now()->addDays(2),
            'created_by' => $request->user()->id,
        ]);

        // Note: We are no longer trying to update the $concern->status here! 
        // It stays 'active' legally!

        return back()->with('success', 'Personnel successfully assigned to mission!');
    }

    public function show(Request $request, string $id): Response
    {
        // 1. Fetch the mission WITH the concern, proof, assignee, and all media!
        $mission = Mission::with(['concern.media', 'proof.media', 'assignee'])
            ->select('missions.*')
            ->addSelect([
                // Grab the map coordinates while we're at it!
                'lat' => \App\Models\Concern::selectRaw('ST_Y(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
                'lng' => \App\Models\Concern::selectRaw('ST_X(location)')
                    ->whereColumn('concerns.id', 'missions.concern_id')
                    ->limit(1),
            ])
            ->findOrFail($id);

        $concern = $mission->concern;

        // 2. Extract Resident's Photos
        $concernImages = [];
        if ($concern && $concern->media) {
            $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
            })->toArray();
        }

        // 3. Extract Worker's Proof Photos
        $proofPhotos = [];
        if ($mission->proof && $mission->proof->media) {
            $proofPhotos = $mission->proof->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
            })->toArray();
        }

        // 4. Pack it up for React!
        $formattedMission = [
            'id' => $mission->id,
            'concern_id' => $concern->id,
            'title' => $concern->title,
            'location' => $concern->address_text ?? 'Unknown location',
            'lat' => $mission->lat,
            'lng' => $mission->lng,
            'priority' => $concern->severity === 'critical' ? 'high' : 'med',
            'status' => $mission->status->value ?? $mission->status,
            'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : null,
            'is_overdue' => $mission->is_overdue,
            'brief' => $concern->description,
            'assignee' => $mission->assignee?->full_name ?? $mission->assignee?->account_id ?? 'Unassigned',
            
            // --- THE IMAGES ---
            'images' => $concernImages,
            'proof_notes' => $mission->proof?->notes,
            'proof_photos' => $proofPhotos,
        ];

        return Inertia::render('Admin/Missions/Show', [
            'mission' => $formattedMission,
        ]);
    }
}