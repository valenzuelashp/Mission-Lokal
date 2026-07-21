<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        // Fetch concerns with media and safely load missions using table join or dynamic check
        $pins = Concern::with(['media'])
            ->select('concerns.*', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->where('barangay_id', $barangayId)
            ->whereNotNull('location')
            ->get()
            ->map(function ($concern) {
                $iconMap = [
                    1 => 'light',
                    2 => 'flood',
                    3 => 'noise',
                    'fire' => 'fire',
                    'flood' => 'flood',
                    'waste' => 'waste',
                    'noise' => 'noise',
                    'light' => 'light'
                ];

                // Safely check for active missions using query builder to prevent relationship mismatch errors
                $activeMission = DB::table('missions')
                    ->where('concern_id', $concern->id)
                    ->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])
                    ->first();

                return [
                    'id' => (string) $concern->id,
                    'report_id' => 'REP-' . strtoupper(substr($concern->id, 0, 4)),
                    'concern_id' => (string) $concern->id,
                    'lat' => (float) $concern->lat,
                    'lng' => (float) $concern->lng,
                    'incident_type' => $concern->title,
                    'location_label' => $concern->address_text ?? 'Pinned Location',
                    'severity' => $concern->severity ?? 'medium',
                    'status' => $concern->status instanceof \App\Enums\ConcernStatus ? $concern->status->value : $concern->status,
                    'type_icon' => $iconMap[$concern->category_id] ?? 'light',
                    'has_mission' => (bool) $activeMission,
                    'mission_id' => $activeMission ? (string) $activeMission->id : null,
                    'time_ago' => $concern->created_at ? $concern->created_at->diffForHumans() : 'Just now',
                ];
            });

        // Pull database calculated hotspots if table exists
        $hotspots = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('hotspots')) {
            $hotspots = DB::table('hotspots')
                ->where('barangay_id', $barangayId)
                ->select('id', 'radius_m', 'report_count', 'risk_level', 'label', 'top_categories', DB::raw('ST_Y(center) as lat'), DB::raw('ST_X(center) as lng'))
                ->get()
                ->map(function ($hotspot) {
                    return [
                        'id' => (string) $hotspot->id,
                        'lat' => (float) $hotspot->lat,
                        'lng' => (float) $hotspot->lng,
                        'radius_m' => (int) $hotspot->radius_m,
                        'report_count' => (int) $hotspot->report_count,
                        'risk_level' => $hotspot->risk_level ?? 'medium',
                        'label' => $hotspot->label ?? 'Hotspot Zone',
                        'categories' => json_decode($hotspot->top_categories, true) ?? [],
                    ];
                })->toArray();
        }

        return Inertia::render('Admin/Map', [
            'pins' => $pins,
            'hotspots' => $hotspots,
        ]);
    }
}