<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Mission;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // 1. Calculate Real Stats from the Database
        $stats = [
            'total_reports' => Concern::count(),
            'ongoing_missions' => Mission::whereIn('status', ['assigned', 'acknowledged', 'in_progress'])->count(),
            'accomplished' => Mission::whereIn('status', ['completed', 'verified'])->count(),
            'pending_verification' => Mission::where('status', 'completed')->count(),
        ];

        // 2. Grab the latest 5 active missions to display in the Queue Table
        $incidents = Mission::with('concern')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($mission) {
                return [
                    'id' => substr($mission->id, 0, 8), // Shorten UUID for display
                    'concern_id' => $mission->concern_id,
                    'incident_type' => $mission->concern->title,
                    'type_icon' => 'alert-triangle', // Default icon for now
                    'location' => $mission->concern->address_text,
                    'ai_severity' => rand(50, 95), // Placeholder until AI is linked
                    'priority' => 'high',
                    'status' => $mission->status->value,
                ];
            });

        // 3. Extract GPS coordinates for the Map Pins
        $mapPins = Concern::select('id', 'title', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->whereNotNull('location')
            ->take(10)
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'lat' => $concern->lat,
                    'lng' => $concern->lng,
                    'title' => $concern->title,
                    'severity' => 'medium',
                ];
            });

        // 4. Send the real data to the React Frontend!
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'incidents' => $incidents,
            'map_pins' => $mapPins,
            // Passing empty activities for now until we build the Audit Logs
            'activities' => [], 
        ]);
    }
}