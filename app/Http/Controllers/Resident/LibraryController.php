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
            'items' => [
                [
                    'id' => 'lib-1',
                    'title' => 'Typhoon preparedness',
                    'category' => 'Disaster response',
                    'description' => 'Checklist before, during, and after a typhoon. Know your evacuation route.',
                    'type' => 'manual',
                ],
                [
                    'id' => 'lib-2',
                    'title' => 'Barangay hall hotline',
                    'category' => 'Emergency contacts',
                    'description' => '0917-123-4567 · Available 8 AM – 5 PM weekdays.',
                    'type' => 'contact',
                ],
                [
                    'id' => 'lib-3',
                    'title' => 'Central Elementary School',
                    'category' => 'Evacuation center',
                    'description' => 'Designated evacuation site for flood-prone zones 1–3.',
                    'type' => 'evacuation',
                ],
                [
                    'id' => 'lib-4',
                    'title' => 'First aid basics',
                    'category' => 'Health & safety',
                    'description' => 'Steps for minor injuries, bleeding, and heat exhaustion.',
                    'type' => 'manual',
                ],
            ],
        ]);
    }
}
