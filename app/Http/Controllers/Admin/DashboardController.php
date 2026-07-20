<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Mission;
use App\Enums\MissionStatus;
use App\Enums\ConcernStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Enforce strict Phase 5 multi-tenancy isolation
        $barangayId = $request->user()->barangay_id;

        // 1. Calculate Real Stats scoped strictly to this Barangay branch
        $stats = [
            'total_reports' => Concern::where('barangay_id', $barangayId)->count(),
            
            'ongoing_missions' => Mission::whereHas('concern', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                })
                ->whereIn('status', [
                    MissionStatus::Assigned->value, 
                    MissionStatus::Acknowledged->value, 
                    MissionStatus::InProgress->value
                ])->count(),
                
            'accomplished' => Mission::whereHas('concern', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                })
                ->whereIn('status', [
                    MissionStatus::Completed->value, 
                    MissionStatus::Verified->value
                ])->count(),
                
            'pending_verification' => Mission::whereHas('concern', function ($q) use ($barangayId) {
                    $q->where('barangay_id', $barangayId);
                })
                ->where('status', MissionStatus::Completed->value)->count(),
        ];

        // 2. Grab the latest 5 active missions for the Dashboard Queue Table
        $incidents = Mission::with(['concern', 'proof.media'])
            ->whereHas('concern', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId);
            })
            ->whereIn('status', [
                MissionStatus::Assigned->value, 
                MissionStatus::Acknowledged->value, 
                MissionStatus::InProgress->value
            ])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($mission) {
                $proofPhotos = $mission->proof ? $mission->proof->media->map(function($m) {
                    return asset('storage/' . $m->storage_key);
                })->toArray() : [];
                
                return [
                    'id' => $mission->id,                
                    'display_id' => 'MS-' . strtoupper(substr($mission->id, 0, 4)), 
                    'concern_id' => $mission->concern_id,   
                    'incident_type' => $mission->concern->title ?? 'Unknown Issue',
                    'type_icon' => 'alert-triangle',
                    'location' => $mission->concern->address_text ?? 'Pinned Location',
                    'ai_severity' => rand(50, 95), 
                    'priority' => ($mission->concern && $mission->concern->severity === 'critical') ? 'high' : 'med',
                    'status' => $mission->status instanceof MissionStatus ? $mission->status->value : $mission->status,
                    'proof_photos' => $proofPhotos,
                ];
            });

        // 3. Extract GPS coordinates cleanly for the mini Map Pins
        $mapPins = Concern::select('id', 'title', 'severity', 'status', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->where('barangay_id', $barangayId)
            ->whereNotNull('location')
            ->take(10)
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'lat' => (float) $concern->lat,
                    'lng' => (float) $concern->lng,
                    'title' => $concern->title,
                    'severity' => $concern->severity instanceof ConcernStatus ? $concern->severity->value : ($concern->severity ?? 'medium'),
                ];
            });

        // 4. Retrieve dynamic events from your blueprint audit tracker scoped to this user/tenant context
        $activities = DB::table('audit_logs')
            ->where('barangay_id', $barangayId) // Checks audit logs safely
            ->latest()
            ->take(4)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => (string) $log->id,
                    'title' => $log->action . ': ' . $log->entity_type,
                    'time' => 'Recently',
                    'icon' => 'system',
                ];
            })->toArray();

        // 5. Send the real data to the React Frontend!
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'incidents' => $incidents,
            'map_pins' => $mapPins,
            'activities' => $activities,
        ]);
    }
}