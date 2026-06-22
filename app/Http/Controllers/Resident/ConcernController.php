<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Support\DemoConcerns;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Resident/Concerns/New', [
            'categories' => $this->categories(),
            'mapCenter' => [14.5995, 120.9842],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // 1. Validate the incoming data from the React form
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string'],
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ]);

        // 2. Grab the resident who is currently logged in
        $user = $request->user();

        // 3. Save it to the database!
        Concern::create([
            'barangay_id' => $user->barangay_id,
            'reporter_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'visibility' => 'public', // Defaulting to public for now
            'status' => 'submitted',  // <--- FIXED!            
            // Format the map coordinates securely for MySQL
            'location' => DB::raw("ST_GeomFromText('POINT({$validated['lng']} {$validated['lat']})', 4326)"),
            'public_location' => DB::raw("ST_GeomFromText('POINT({$validated['lng']} {$validated['lat']})', 4326)"),
            
            // Temporary placeholder until we build the Reverse Geocoding API later
            'address_text' => 'Pinned Location: ' . round($validated['lat'], 4) . ', ' . round($validated['lng'], 4),
        ]);

        // 4. Redirect them back to the feed with a success message
        return redirect()
            ->route('feed')
            ->with('success', 'Concern successfully submitted to the barangay!');
    }

    public function show(string $concern): Response
    {
        // 1. Fetch the real concern from the database
        $record = Concern::select(
                '*',
                DB::raw('ST_Y(location) as lat, ST_X(location) as lng')
            )->findOrFail($concern);

        // 2. Format it exactly how the React frontend (Show.tsx) expects it!
        $formattedConcern = [
            'id' => $record->id,
            'title' => $record->title,
            'description' => $record->description,
            'category' => 'General', 
            'status' => $record->status->value ?? $record->status,
            
            // Provide a fallback severity since new posts haven't been processed by AI yet
            'severity' => $record->severity?->value ?? 'medium', 
            
            // React expects 'location_label' instead of 'address'
            'location_label' => $record->address_text ?? 'Unknown location', 
            'lat' => $record->lat,
            'lng' => $record->lng,
            
            'created_at' => $record->created_at->format('M d, Y h:i A'),
            
            // React expects 'vote_count' and 'user_vote' for the buttons
            'vote_count' => 0,
            'user_vote' => null,
            'images' => [], 

            // THE MISSING PIECE: The timeline array React needs to loop over!
            'timeline' => [
                [
                    'key' => 'submitted',
                    'label' => 'Concern Submitted',
                    'state' => 'done',
                    'at' => $record->created_at->format('M d, Y h:i A')
                ],
                [
                    'key' => 'review',
                    'label' => 'Under Review',
                    'state' => $record->status === 'submitted' ? 'current' : 'done'
                ],
                [
                    'key' => 'resolved',
                    'label' => 'Resolved',
                    'state' => $record->status === 'resolved' ? 'done' : 'upcoming'
                ],
            ],
        ];

        // 3. Send it to the page!
        return Inertia::render('Resident/Concerns/Show', [
            'concern' => $formattedConcern,
        ]);
    }
    
    public function vote(Request $request, string $concern): RedirectResponse
    {
        $request->validate([
            'vote' => ['required', 'in:up,down'],
        ]);

        DemoConcerns::vote($concern, $request->string('vote')->toString());

        return back();
    }

    /** @return list<array{value: string, label: string}> */
    private function categories(): array
    {
        return [
            ['value' => 'drainage', 'label' => 'Infrastructure · Clogged drainage'],
            ['value' => 'street_light', 'label' => 'Infrastructure · Street light'],
            ['value' => 'waste', 'label' => 'Sanitation · Uncollected waste'],
            ['value' => 'noise', 'label' => 'Sanitation · Noise complaint'],
            ['value' => 'road', 'label' => 'Infrastructure · Damaged roads'],
            ['value' => 'safety', 'label' => 'Public safety · Other'],
        ];
    }
}