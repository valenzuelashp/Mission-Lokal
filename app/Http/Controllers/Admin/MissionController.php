<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Concern;
use App\Models\Mission;
use App\Models\Personnel;
use App\Models\User;
use App\Enums\MissionStatus;
use App\Enums\ConcernStatus;
use App\Jobs\SendMissionAssignmentSms;
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
            ->with(['votes', 'duplicates.reporter', 'duplicateOf'])
            ->get();

        $realMissions = Mission::with('personnel.user')
            ->whereIn('concern_id', $concerns->pluck('id'))
            ->get()
            ->keyBy('concern_id');

        $mappedMissions = $concerns->map(function ($concern) use ($realMissions) {
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
            $duplicateBoost = $mergedCount * 30; // Boost missions that consolidate multiple resident reports
            $priorityScore = $severityScore + ($upvotes * 10) + $duplicateBoost;

            return [
                'id' => $rawId, 
                'display_id' => 'MS-' . strtoupper(substr($rawId, 0, 4)),
                'concern_id' => $concern->id,
                'concern_title' => $concern->title,
                'location' => $concern->address_text ?? 'Unknown location',
                'assignee' => $assigneeNames,
                'personnel_ids' => $personnelIds,
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'priority_score' => $priorityScore,
                'status' => $statusStr,
                'due_date' => $mission && $mission->due_date ? $mission->due_date->format('M d, Y') : ($concern->created_at ? $concern->created_at->addDays(2)->format('M d, Y') : 'Not set'),
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
            'personnel_ids' => ['present', 'array'],
            'personnel_ids.*' => ['exists:personnel,id'], 
        ]);

        $concern = Concern::findOrFail($validated['concern_id']);
        $barangayId = $request->user()->barangay_id;

        if ($concern->barangay_id !== $barangayId) {
            abort(403, 'Unauthorized context registration.');
        }

        $newlyAssignedPersonnelIds = [];
        $missionId = null;

        DB::transaction(function () use ($validated, $concern, $request, $barangayId, &$newlyAssignedPersonnelIds, &$missionId) {
            $mission = Mission::updateOrCreate(
                ['concern_id' => $concern->id],
                [
                    'barangay_id' => $concern->barangay_id,
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

            $mission->personnel()->sync($syncData);

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
                'personnel.user'
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
                'location' => $concern->address_text ?? 'Unknown location',
                'priority' => $concern->severity === 'critical' ? 'high' : 'med',
                'status' => $mission->status->value ?? $mission->status,
                'due_date' => $mission->due_date ? $mission->due_date->format('M d, Y') : null,
                'is_overdue' => (bool)$mission->is_overdue,
                'brief' => $concern->description,
                'assignee' => $assigneeNames,
                'images' => $concernImages,
                'proof_notes' => $mission->proof?->notes,
                'proof_photos' => $proofPhotos,
                'assigned_at' => $mission->created_at->format('M d, Y'),
                'merged_duplicates' => $mergedDuplicates,
            ],
        ]);
    }

    public function verifyMission(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;

        DB::transaction(function () use ($id, $barangayId, $request) {
            $mission = Mission::where('barangay_id', $barangayId)->findOrFail($id);
            $mission->update([
                'status' => 'verified',
                'verified_at' => now(),
                'verified_by' => Auth::id(),
            ]);
            $concern = Concern::where('id', $mission->concern_id)->with('duplicates')->first();
            
            if ($concern) {
                $concern->update(['status' => 'resolved']);
                
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
                    $duplicateConcern->update(['status' => 'resolved']);
                    
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
}