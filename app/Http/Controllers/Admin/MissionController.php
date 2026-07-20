<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class MissionController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $concerns = Concern::where('barangay_id', $barangayId)
            ->whereIn('status', ['active', 'resolved', 'in_progress'])
            ->latest()
            ->get();

        $realMissions = Mission::with('assignee')
            ->whereIn('concern_id', $concerns->pluck('id'))
            ->get()
            ->keyBy('concern_id');

        $missions = $concerns->map(function ($concern) use ($realMissions) {
            $mission = $realMissions->get($concern->id);

            return [
                'raw_mission_id' => $mission ? $mission->id : null,
                'id' => $mission ? 'MS-' . strtoupper(substr($mission->id, 0, 4)) : 'MS-' . strtoupper(substr($concern->id, 0, 4)),
                'concern_id' => $concern->id,
                'concern_title' => $concern->title,
                'location' => $concern->address_text ?? 'Unknown location',
                'assignee' => $mission?->assignee?->full_name ?? $mission?->assignee?->account_id ?? null,
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'status' => $mission ? ($mission->status->value ?? $mission->status) : 'assigned',
                'due_date' => $mission && $mission->due_date ? $mission->due_date->format('M d, Y') : ($concern->created_at ? $concern->created_at->addDays(2)->format('M d, Y') : 'Not set'),
                'is_overdue' => $mission ? (bool)$mission->is_overdue : false,
                'is_escalated' => $mission ? (bool)$mission->is_escalated : false,
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

        if ($concern->barangay_id !== $request->user()->barangay_id) {
            abort(403, 'Unauthorized context registration.');
        }

        DB::transaction(function () use ($validated, $concern, $request) {
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $concern->barangay_id,
                    'assigned_to' => $validated['assigned_to'],
                    'status' => 'assigned',
                    'due_date' => now()->addDays(2),
                    'created_by' => $request->user()->id,
                ]
            );

            DB::table('mission_assignments')->insert([
                'id' => (string) Str::uuid(),
                'mission_id' => $mission->id,
                'personnel_id' => $validated['assigned_to'],
                'assigned_by' => $request->user()->id,
                'assigned_at' => now(),
            ]);
        });

        return back()->with('success', 'Personnel successfully assigned to mission!');
    }

    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;

        $mission = Mission::where('barangay_id', $barangayId)
            ->with(['concern.media', 'proof.media', 'assignee'])
            ->findOrFail($id);

        $concern = $mission->concern;
        $concernImages = $concern->media?->map(fn($m) => asset('storage/'.$m->storage_key))->toArray() ?? [];
        $proofPhotos = $mission->proof?->media?->map(fn($m) => asset('storage/'.$m->storage_key))->toArray() ?? [];

        return Inertia::render('Admin/Missions/Show', [
            'mission' => [
                'id' => $mission->id,
                'concern_id' => $concern->id,
                'title' => $concern->title,
                'location' => $concern->address_text ?? 'Unknown location',
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'status' => $mission->status->value ?? $mission->status,
                'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : null,
                'is_overdue' => (bool)$mission->is_overdue,
                'brief' => $concern->description,
                'assignee' => $mission->assignee?->full_name ?? $mission->assignee?->account_id ?? 'Unassigned',
                'images' => $concernImages,
                'proof_notes' => $mission->proof?->notes,
                'proof_photos' => $proofPhotos,
                'assigned_at' => $mission->created_at->format('M d, Y'),
            ],
        ]);
    }

    public function verifyMission(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;

        DB::transaction(function () use ($id, $barangayId) {
            $mission = Mission::where('barangay_id', $barangayId)->findOrFail($id);
            $mission->update([
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => Auth::id(),
            ]);
            Concern::where('id', $mission->concern_id)->update(['status' => 'resolved']);
        });

        return back()->with('success', 'Mission verified and concern resolved.');
    }
}