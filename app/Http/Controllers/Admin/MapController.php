<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Support\MapHelpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $pins = Concern::with(['media'])
            ->select('concerns.*', DB::raw('ST_X(location) as raw_x, ST_Y(location) as raw_y'))
            ->where('barangay_id', $barangayId)
            ->whereNotNull('location')
            ->get()
            ->map(function ($concern) {
                $severity = in_array($concern->severity, ['low', 'medium', 'high', 'critical'], true)
                    ? $concern->severity
                    : 'medium';

                $status = $concern->status instanceof \App\Enums\ConcernStatus
                    ? $concern->status->value
                    : $concern->status;

                $activeMission = DB::table('missions')
                    ->where('concern_id', $concern->id)
                    ->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])
                    ->first();

                // Robust coordinate orientation check
                $x = (float) $concern->raw_x;
                $y = (float) $concern->raw_y;
                if ($x > 90) {
                    $lng = $x;
                    $lat = $y;
                } else {
                    $lat = $x;
                    $lng = $y;
                }

                return [
                    'id' => (string) $concern->id,
                    'report_id' => 'REP-'.strtoupper(substr($concern->id, 0, 4)),
                    'concern_id' => (string) $concern->id,
                    'lat' => $lat,
                    'lng' => $lng,
                    'incident_type' => $concern->title,
                    'location_label' => $concern->address_text ?? 'Pinned Location',
                    'severity' => $severity,
                    'status' => $status,
                    'type_icon' => MapHelpers::typeIconFromText($concern->title, $concern->address_text),
                    'has_mission' => (bool) $activeMission,
                    'mission_id' => $activeMission ? (string) $activeMission->id : null,
                    'ai_severity' => MapHelpers::scoreFromSeverity($severity),
                    'time_ago' => $concern->created_at ? $concern->created_at->diffForHumans() : 'Just now',
                ];
            });

        $hotspots = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('hotspots')) {
            $hotspots = DB::table('hotspots')
                ->where('barangay_id', $barangayId)
                ->select(
                    'id',
                    'radius_m',
                    'report_count',
                    'risk_level',
                    'label',
                    'top_categories',
                    DB::raw('ST_X(center) as raw_x'),
                    DB::raw('ST_Y(center) as raw_y')
                )
                ->get()
                ->map(function ($hotspot) {
                    $x = (float) $hotspot->raw_x;
                    $y = (float) $hotspot->raw_y;
                    if ($x > 90) {
                        $lng = $x;
                        $lat = $y;
                    } else {
                        $lat = $x;
                        $lng = $y;
                    }

                    return [
                        'id' => (string) $hotspot->id,
                        'lat' => $lat,
                        'lng' => $lng,
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