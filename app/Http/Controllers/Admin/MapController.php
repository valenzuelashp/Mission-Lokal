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
        // Fetch current authenticated admin's barangay context matching multi-tenancy rules
        $barangayId = $request->user()->barangay_id;

        // Fetch all concerns that haven't been resolved or rejected yet for this barangay
        $pins = Concern::select('id', 'title', 'description', 'severity', 'status', 'created_at', 'address_text', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->where('barangay_id', $barangayId)
            ->whereNotIn('status', ['resolved', 'closed', 'rejected', 'spam'])
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'report_id' => 'REP-' . strtoupper(substr($concern->id, 0, 4)),
                    'lat' => (float) $concern->lat,
                    'lng' => (float) $concern->lng,
                    'incident_type' => $concern->title,
                    'location_label' => $concern->address_text ?? 'Pinned Location',
                    'severity' => $concern->severity?->value ?? $concern->severity ?? 'medium',
                    'status' => $concern->status->value ?? $concern->status,
                    'type_icon' => 'alert-triangle', // Default fallback
                    'time_ago' => $concern->created_at ? $concern->created_at->diffForHumans() : 'Just now',
                ];
            });

        // Pull database calculated hotspots if the tracking table is deployed
        $hotspots = [];
        if (\Illuminate\Support\Facades\Schema::hasTable('hotspots')) {
            $hotspots = DB::table('hotspots')
                ->where('barangay_id', $barangayId)
                ->select('id', 'radius_m', 'report_count', 'top_categories', DB::raw('ST_Y(center) as lat'), DB::raw('ST_X(center) as lng'))
                ->get()
                ->map(function ($hotspot) {
                    return [
                        'id' => $hotspot->id,
                        'lat' => (float) $hotspot->lat,
                        'lng' => (float) $hotspot->lng,
                        'radius' => (int) $hotspot->radius_m,
                        'count' => (int) $hotspot->report_count,
                        'categories' => json_decode($hotspot->top_categories, true) ?? [],
                    ];
                })->toArray();
        }

        // Send the live data collection straight into the React Layout matching props
        return Inertia::render('Admin/Map', [
            'pins' => $pins,
            'hotspots' => $hotspots,
        ]);
    }
}