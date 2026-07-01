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
        $incidents = Mission::with(['concern', 'proof.media'])
            ->whereIn('status', ['assigned', 'acknowledged', 'in_progress']) // Only show active ones on the dash
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
                    'incident_type' => $mission->concern->title,
                    'type_icon' => 'alert-triangle', // Default icon for now
                    'location' => $mission->concern->address_text ?? 'Pinned Location',
                    'ai_severity' => rand(50, 95), // Placeholder until AI is linked
                    'priority' => $mission->concern->severity === 'critical' ? 'high' : 'med',
                    'status' => $mission->status->value ?? $mission->status,
                    'proof_photos' => $proofPhotos,
                ];
            });

        // 3. Extract GPS coordinates for the mini Map Pins
        $mapPins = Concern::select('id', 'title', 'severity', 'status', DB::raw('ST_Y(location) as lat, ST_X(location) as lng'))
            ->whereNotNull('location')
            ->take(10)
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'lat' => $concern->lat,
                    'lng' => $concern->lng,
                    'title' => $concern->title,
                    'severity' => $concern->severity?->value ?? 'medium',
                ];
            });

        // 4. Send the real data to the React Frontend!
        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'incidents' => $incidents,
            'map_pins' => $mapPins,
            'activities' => [], // Empty until Audit Logs are built
        ]);
    }
}