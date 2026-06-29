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
        // 1. Validate the incoming data.
        //    - category_id is sent by the frontend as 'category_id' now (was 'category')
        //    - subcategory_id is optional since the form has no subcategory picker yet
        $validated = $request->validate([
            'category_id'  => 'required|exists:concern_categories,id',
            'title'        => 'required|string|max:255',
            'description'  => 'required|string',
            'address_text' => 'nullable|string|max:512',
            'lat'          => 'required|numeric',
            'lng'          => 'required|numeric',
            'images.*'     => 'nullable|image|max:10240',
        ]);
 
        $user     = $request->user();
        $category = ConcernCategory::findOrFail($validated['category_id']);
 
        // MySQL spatial: longitude comes FIRST in POINT(lng lat)
        $point = DB::raw("ST_GeomFromText('POINT({$validated['lng']} {$validated['lat']})', 4326)");
 
        // 2. Save the concern.
        //    - severity: DB enum only allows low/medium/high/critical — 'minor' was invalid!
        //    - subcategory_id: nullable so we skip it until the form has a subcategory picker
        $newConcern = Concern::create([
            'barangay_id'  => $user->barangay_id,
            'reporter_id'  => $user->id,
            'category_id'  => $validated['category_id'],
            'title'        => $validated['title'],
            'description'  => $validated['description'],
            'location'     => $point,
            'public_location' => $point,
            'address_text' => $validated['address_text']
                ?? ('Pinned Location: ' . round($validated['lat'], 4) . ', ' . round($validated['lng'], 4)),
            'visibility'   => $category->default_visibility === 'private' ? 'private' : 'public',
            'severity'     => 'low',      // FIX: 'minor' is not a valid enum value
            'status'       => 'submitted', // FIX: let it start at submitted (the DB default)
        ]);
 
        // 3. Save uploaded images and create ConcernMedia records.
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $photo) {
                $filePath = $photo->store('concerns', 'public');
 
                ConcernMedia::create([
                    'concern_id' => $newConcern->id,
                    'storage_key' => $filePath,
                    'mime_type'   => $photo->getMimeType(),
                    'sort_order'  => $index,
                ]);
            }
        }
 
        // 4. Redirect to the feed with a success flash.
        return redirect()->route('feed')->with('success', 'Concern submitted successfully.');
    }
 
    public function show(string $concern): Response
    {
        $record = Concern::with(['media', 'mission.proof.media'])
            ->select(
                '*',
                DB::raw('ST_Y(location) as lat, ST_X(location) as lng')
            )->findOrFail($concern);
 
        $publicImages = $record->media->sortBy('sort_order')->map(function ($media) {
            return asset('storage/' . $media->storage_key);
        })->toArray();
 
        $proofPhotos = [];
        $proofNotes  = null;
        if ($record->mission && $record->mission->proof) {
            $proofNotes  = $record->mission->proof->notes;
            $proofPhotos = $record->mission->proof->media->sortBy('sort_order')->map(function ($media) {
                return asset('storage/' . $media->storage_key);
            })->toArray();
        }
 
        $formattedConcern = [
            'id'             => $record->id,
            'title'          => $record->title,
            'description'    => $record->description,
            'category'       => $record->category->name ?? 'Uncategorized',
            'status'         => $record->status->value ?? $record->status,
            'severity'       => $record->severity?->value ?? 'low',
            'location_label' => $record->address_text ?? 'Unknown location',
            'lat'            => $record->lat,
            'lng'            => $record->lng,
            'created_at'     => $record->created_at->format('M d, Y h:i A'),
            'vote_count'     => 0,
            'user_vote'      => null,
            'images'         => $publicImages,
            'proof_notes'    => $proofNotes,
            'proof_photos'   => $proofPhotos,
            'timeline'       => [
                [
                    'key'   => 'submitted',
                    'label' => 'Concern Submitted',
                    'state' => 'done',
                    'at'    => $record->created_at->format('M d, Y h:i A'),
                ],
                [
                    'key'   => 'review',
                    'label' => 'Under Review',
                    'state' => $record->status->value === 'submitted' ? 'current' : 'done',
                ],
                [
                    'key'   => 'resolved',
                    'label' => 'Resolved',
                    'state' => $record->status->value === 'resolved' ? 'done' : 'upcoming',
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
        return ConcernCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                return [
                    'value' => (string) $category->id,
                    'label' => $category->name,
                ];
            })
            ->toArray();
    }
}