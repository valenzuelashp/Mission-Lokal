<?php
 
namespace App\Http\Controllers\Resident;

use App\Jobs\Ai\ProcessConcernWithAi;
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
 
        $point = DB::raw("ST_GeomFromText('POINT({$validated['lng']} {$validated['lat']})', 4326)");
 
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
            'severity'     => 'low',
            'status'       => 'submitted',
        ]);
 
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
        
        ProcessConcernWithAi::dispatch($newConcern);
 
        return redirect()->route('feed')->with('success', 'Concern submitted successfully.');
    }
 
    // UPDATED: Added Request $request to get the user's vote
    public function show(Request $request, string $concern): Response
    {
        $user = $request->user();

        $record = Concern::with([
                'category', 
                'media', 
                'mission.proof.media',
                // Eager load the current user's vote
                'votes' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ])
            // Count upvotes and downvotes separately
            ->withCount([
                'votes as upvotes' => fn ($query) => $query->where('vote', 1),
                'votes as downvotes' => fn ($query) => $query->where('vote', -1),
            ])
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

        // Extract user's specific vote
        $userVoteRecord = $record->votes->first();
        $userVoteStatus = null;
        if ($userVoteRecord) {
            $userVoteStatus = $userVoteRecord->vote === 1 ? 'up' : 'down';
        }

        // Dynamic State Machine Timeline Builder
        $status = $record->status->value ?? $record->status;
        $timeline = [
            [
                'key'   => 'submitted',
                'label' => 'Concern Submitted',
                'state' => 'done',
                'at'    => $record->created_at->format('M d, Y h:i A'),
            ]
        ];

        // If rejected/spam, branch the timeline
        if (in_array($status, ['rejected', 'spam'])) {
            $timeline[] = [
                'key'   => 'rejected',
                'label' => 'Report Rejected',
                'state' => 'current',
                'at'    => $record->updated_at->format('M d, Y h:i A'),
            ];
        } else {
            // Standard resolution path
            $isReviewDone = in_array($status, ['active', 'resolved', 'closed']);
            $timeline[] = [
                'key'   => 'review',
                'label' => 'Under Review',
                'state' => $isReviewDone ? 'done' : 'current',
                'at'    => $record->staff_reviewed_at ? $record->staff_reviewed_at->format('M d, Y h:i A') : null,
            ];

            $isActiveDone = in_array($status, ['resolved', 'closed']);
            $timeline[] = [
                'key'   => 'active',
                'label' => 'Active Response',
                'state' => $isActiveDone ? 'done' : ($status === 'active' ? 'current' : 'upcoming'),
                'at'    => $record->mission?->created_at ? $record->mission->created_at->format('M d, Y h:i A') : null,
            ];

            $timeline[] = [
                'key'   => 'resolved',
                'label' => 'Resolved',
                'state' => $isActiveDone ? 'done' : 'upcoming',
                'at'    => $isActiveDone ? $record->updated_at->format('M d, Y h:i A') : null,
            ];
        }
 
        $formattedConcern = [
            'id'             => $record->id,
            'title'          => $record->title,
            'description'    => $record->description,
            'category'       => $record->category->name ?? 'Uncategorized',
            'status'         => $status,
            'severity'       => $record->severity?->value ?? 'low',
            'location_label' => $record->address_text ?? 'Unknown location',
            'lat'            => $record->lat,
            'lng'            => $record->lng,
            'created_at'     => $record->created_at->format('M d, Y h:i A'),
            
            // Pass the new separate counts:
            'upvotes'        => (int) $record->upvotes,
            'downvotes'      => (int) $record->downvotes,
            
            'user_vote'      => $userVoteStatus,
            'images'         => $publicImages,
            'proof_notes'    => $proofNotes,
            'proof_photos'   => $proofPhotos,
            'timeline'       => $timeline,
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

        $voteValue = $request->vote === 'up' ? 1 : -1;

        DB::table('concern_votes')->updateOrInsert(
            [
                'concern_id' => $concern, 
                'user_id' => $request->user()->id
            ],
            [
                'vote' => $voteValue,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
 
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