<?php

namespace App\Http\Controllers\Resident;

use App\Models\ConcernCategory;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Support\DemoConcerns;
use App\Models\ConcernMedia;
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
            'category_id' => 'required|exists:concern_categories,id',
            'subcategory_id' => 'required|exists:concern_subcategories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'address_text' => 'nullable|string|max:512',
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
        ]);

        $user = $request->user();
        $category = \App\Models\ConcernCategory::findOrFail($validated['category_id']);
        
        $point = DB::raw("ST_GeomFromText('POINT({$validated['lng']} {$validated['lat']})', 4326)");

        // 2. Save it to the database with the Security Lock!
        $newConcern = Concern::create([
            'barangay_id' => $user->barangay_id,
            'user_id' => $user->id, // NOTE: Change this to 'reporter_id' if your DB migration uses reporter_id instead of user_id!
            'category_id' => $validated['category_id'],
            'subcategory_id' => $validated['subcategory_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'location' => $point,
            'public_location' => $point,
            'address_text' => $validated['address_text'] ?? ('Pinned Location: ' . round($validated['lat'], 4) . ', ' . round($validated['lng'], 4)),
            
            // SECURITY LOCK: Force the visibility based on the category rules!
            'visibility' => $category->default_visibility === 'private' ? 'private' : 'public',
            
            'severity' => 'minor',
            'status' => 'active', 
        ]);

        // 3. THE MAGIC: Save the physical files and create the Media records!
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $photo) {
                $filePath = $photo->store('concerns', 'public');

                \App\Models\ConcernMedia::create([
                    'concern_id' => $newConcern->id,
                    'storage_key' => $filePath,
                    'mime_type' => $photo->getMimeType(),
                    'sort_order' => $index,
                ]);
            }
        }

        // 4. Redirect them back to the feed
        return redirect()->route('feed')->with('success', 'Concern submitted successfully.');
    }
    public function show(string $concern): Response
    {
        // 1. Fetch the concern WITH the attached media!
        $record = Concern::with(['media', 'mission.proof.media'])
            ->select(
                '*',
                DB::raw('ST_Y(location) as lat, ST_X(location) as lng')
            )->findOrFail($concern);

        // 2. Generate the public URLs for the resident's images
        $publicImages = $record->media->sortBy('sort_order')->map(function ($media) {
            return asset('storage/' . $media->storage_key);
        })->toArray();

        $proofPhotos = [];
        $proofNotes = null;
        if ($record->mission && $record->mission->proof) {
            $proofNotes = $record->mission->proof->notes;
            $proofPhotos = $record->mission->proof->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
            })->toArray();
        }

        // 3. Format it exactly how the React frontend (Show.tsx) expects it!
        $formattedConcern = [
            'id' => $record->id,
            'title' => $record->title,
            'description' => $record->description,
            'category' => $record->category->name ?? 'Uncategorized',            
            'status' => $record->status->value ?? $record->status,
            'severity' => $record->severity?->value ?? 'medium', 
            'location_label' => $record->address_text ?? 'Unknown location', 
            'lat' => $record->lat,
            'lng' => $record->lng,
            'created_at' => $record->created_at->format('M d, Y h:i A'),
            'vote_count' => 0,
            'user_vote' => null,
            
            // --- INJECT THE REAL IMAGES HERE! ---
            'images' => $publicImages, 
            'proof_notes' => $proofNotes,
            'proof_photos' => $proofPhotos,
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

   private function categories(): array
    {
        // Fetch all active categories from the database, sorted by their official order
        return ConcernCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                return [
                    // We use the ID as the value so we can easily save it to the concerns table
                    'value' => (string) $category->id, 
                    'label' => $category->name,
                ];
            })
            ->toArray();
    }
}