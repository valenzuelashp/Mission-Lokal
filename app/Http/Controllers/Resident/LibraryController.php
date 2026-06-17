<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LibraryController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resident/Library', [
            'manuals' => [
                [
                    'id' => 'manual-flood',
                    'title' => 'Flood Preparedness',
                    'subtitle' => 'Emergency bag checklist & evacuation routes',
                    'icon' => 'flood',
                    'body' => 'Pack a go-bag with water, non-perishable food, flashlight, and copies of IDs. Know your barangay evacuation route and the nearest designated center. Move valuables to higher ground when advisories are raised.',
                ],
                [
                    'id' => 'manual-earthquake',
                    'title' => 'Earthquake Safety',
                    'subtitle' => 'Drop, Cover, and Hold on protocols',
                    'icon' => 'earthquake',
                    'body' => 'During shaking: drop to the ground, take cover under sturdy furniture, and hold on. After shaking stops, check for injuries and hazards before evacuating. Avoid elevators and damaged structures.',
                ],
                [
                    'id' => 'manual-fire',
                    'title' => 'Fire Prevention',
                    'subtitle' => 'Home safety audit and extinguisher guide',
                    'icon' => 'fire',
                    'body' => 'Inspect wiring, keep extinguishers accessible, and never block exits. If a fire starts, alert others, use an extinguisher only if safe, and evacuate immediately. Call the local fire station once you are outside.',
                ],
            ],
            'contacts' => [
                [
                    'id' => 'contact-captain',
                    'name' => 'Brgy. Captain - Office',
                    'role' => 'Community Head',
                    'phone' => '09171234567',
                    'icon' => 'office',
                ],
                [
                    'id' => 'contact-fire',
                    'name' => 'Local Fire Station',
                    'role' => 'Fire & Rescue',
                    'phone' => '09189876543',
                    'icon' => 'fire',
                    'emergency' => true,
                ],
                [
                    'id' => 'contact-health',
                    'name' => 'Municipal Health Center',
                    'role' => 'Medical Aid',
                    'phone' => '09175551234',
                    'icon' => 'health',
                ],
                [
                    'id' => 'contact-pnp',
                    'name' => 'PNP Sub-Station',
                    'role' => 'Public Safety',
                    'phone' => '09179998877',
                    'icon' => 'police',
                ],
                [
                    'id' => 'contact-hall',
                    'name' => 'Barangay Hall Desk',
                    'role' => 'General inquiries',
                    'phone' => '028881234',
                    'icon' => 'office',
                ],
                [
                    'id' => 'contact-mdrrmo',
                    'name' => 'MDRRMO Hotline',
                    'role' => 'Disaster response',
                    'phone' => '09171112233',
                    'icon' => 'health',
                    'emergency' => true,
                ],
            ],
        ]);
    }
}
