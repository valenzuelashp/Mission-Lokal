<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    public function index(): Response
    {
        // Fetch all concerns that haven't been resolved or rejected yet
        $pins = Concern::select('id', 'title', 'description', 'severity', 'status', 'created_at', 'address_text', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->whereNotIn('status', ['resolved', 'closed', 'rejected', 'spam'])
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'report_id' => 'REP-' . strtoupper(substr($concern->id, 0, 4)),
                    'lat' => $concern->lat,
                    'lng' => $concern->lng,
                    'incident_type' => $concern->title,
                    'location_label' => $concern->address_text ?? 'Pinned Location',
                    'severity' => $concern->severity?->value ?? 'medium',
                    'status' => $concern->status->value ?? $concern->status,
                    'type_icon' => 'alert-triangle', // Default fallback
                    'time_ago' => $concern->created_at->diffForHumans(),
                ];
            });

        // We will send empty hotspots for now until the AI clustering script is built
        return Inertia::render('Admin/Map', [
            'pins' => $pins,
            'hotspots' => [],
        ]);
    }
}