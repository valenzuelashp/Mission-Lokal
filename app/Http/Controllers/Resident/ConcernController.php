<?php

namespace App\Http\Controllers\Resident;

use App\Services\Concerns\FileUploadService;
use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\ConcernStatusHistory;
use App\Enums\ConcernStatus;
use App\Models\ConcernVote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    /**
     * R8: Display the collective Public Community Concern Feed.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // 1. Row-level access query rules for private vs public visibility bounds
        $concerns = Concern::where('barangay_id', $user->barangay_id)
            ->where(function ($query) use ($user) {
                $query->where('visibility', 'public')
                      ->orWhere('reporter_id', $user->id);
            })
            ->withCount([
                'votes as upvotes_count' => fn($q) => $q->where('vote_type', 'up'),
                'votes as downvotes_count' => fn($q) => $q->where('vote_type', 'down')
            ])
            ->latest()
            ->get()
            ->map(fn($item) => [
                'id' => (string) $item->id,
                'title' => $item->title,
                'category' => ucwords(str_replace('_', ' ', $item->category_id)),
                'severity' => $item->severity ?? 'medium',
                'status' => $item->status->value ?? $item->status, 
                'upvotes' => (int) $item->upvotes_count,
                'downvotes' => (int) $item->downvotes_count,
                'location_label' => $item->address_text ?? 'Pinpointed Coordinates',
                'created_at' => $item->created_at->format('M d, Y'),
                'images' => $item->media->take(1)->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
            ]);

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns
        ]);
    }

    /**
     * R9: Render the Post New Concern view setup.
     */
    public function create(): Response
    {
        return Inertia::render('Resident/Concerns/New', [
            'categories' => [
                ['value' => 'fire', 'label' => 'Fire Hazard'],
                ['value' => 'flood', 'label' => 'Flooding & Drainage'],
                ['value' => 'waste', 'label' => 'Solid Waste & Illegal Dumping'],
                ['value' => 'noise', 'label' => 'Noise Disturbance'],
                ['value' => 'light', 'label' => 'Broken Streetlights'],
            ],
            'mapCenter' => [14.6507, 120.9793]
        ]);
    }

    /**
     * R9: Save formal community concern report records using atomic transactions.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'min:10'],
            'category_id' => ['required', 'string'],
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $user = auth()->user();

        DB::transaction(function () use ($request, $user) {
            $concern = Concern::create([
                'barangay_id' => $user->barangay_id,
                'reporter_id' => $user->id,
                'title' => $request->title,
                'description' => $request->description,
                'category_id' => $request->category_id,
                'visibility' => 'private', 
                'status' => ConcernStatus::Submitted, 
                'location' => DB::raw("ST_SRID(POINT({$request->lng}, {$request->lat}), 4326)"),
                'address_text' => $request->address_text ?? "Coordinates: {$request->lat}, {$request->lng}",
                'is_blotter_candidate' => false,
                'severity_confirmed' => false,
            ]);

            if ($request->hasFile('images')) {
                // FIX: Resolved file processing through your unified domain service layout
                $uploadService = app(FileUploadService::class);

                foreach ($request->file('images') as $index => $file) {
                    $path = $uploadService->upload($file, 'concerns', 'image');

                    $concern->media()->create([
                        'id' => Str::uuid()->toString(),
                        'storage_key' => $path,
                        'mime_type' => $file->getMimeType(),
                        'sort_order' => $index,
                    ]);
                }
            }

            ConcernStatusHistory::create([
                'concern_id' => $concern->id,
                'from_status' => null,
                'to_status' => 'submitted',
                'actor_id' => $user->id,
                'note' => 'Concern posted by resident.',
            ]);
    });

        return redirect()->route('feed')->with('success', 'Concern submitted successfully!');
    }

    /**
     * R10: Render specific details with row-level authorization boundaries.
     */
    public function show(Request $request, Concern $concern): Response
    {
        $user = $request->user();

        // Security authorization checkpoint rules
        if ($concern->barangay_id !== $user->barangay_id) {
            abort(403, 'Unauthorized access request outside geographic boundary.');
        }

        if ($concern->visibility === 'private' && $concern->reporter_id !== $user->id) {
            abort(403, 'This concern is private and restricted to the original reporter.');
        }

        $locationData = DB::selectOne("SELECT ST_X(location) as lng, ST_Y(location) as lat FROM concerns WHERE id = ?", [$concern->id]);

        $upvotes = $concern->votes()->where('vote_type', 'up')->count();
        $downvotes = $concern->votes()->where('vote_type', 'down')->count();
        $userVote = $concern->votes()->where('user_id', $user->id)->value('vote_type');

        $timeline = DB::table('concern_status_histories')
            ->where('concern_id', $concern->id)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn($log) => [
                'key' => (string) $log->id,
                'label' => ucwords(str_replace('_', ' ', $log->to_status)),
                'description' => $log->note,
                'at' => \Carbon\Carbon::parse($log->created_at)->format('M d, Y g:i A'),
                'state' => 'done'
            ])->toArray();

        if (empty($timeline)) {
            $timeline[] = [
                'key' => 'initial',
                'label' => 'Submitted',
                'description' => 'Concern successfully logged for review.',
                'at' => $concern->created_at->format('M d, Y g:i A'),
                'state' => 'current'
            ];
        }

        return Inertia::render('Resident/Concerns/Show', [
            'concern' => [
                'id' => (string) $concern->id,
                'title' => $concern->title,
                'category' => ucwords(str_replace('_', ' ', $concern->category_id)),
                'severity' => $concern->severity ?? 'medium',
                'status' => $concern->status->value ?? $concern->status,
                'description' => $concern->description,
                'location_label' => $concern->address_text ?? 'Pinpointed Location',
                'lat' => $locationData ? $locationData->lat : 14.6507,
                'lng' => $locationData ? $locationData->lng : 120.9793,
                'upvotes' => $upvotes,
                'downvotes' => $downvotes,
                'user_vote' => $userVote,
                'created_at' => $concern->created_at->format('M d, Y'),
                'images' => $concern->media->map(fn($m) => asset('storage/' . $m->storage_key))->toArray(),
                'timeline' => $timeline
            ]
        ]);
    }

    /**
     * Complete, Idempotent Voting Engine Pipeline with Toggle Inversions.
     */
    public function vote(Request $request, Concern $concern): RedirectResponse
    {
        $request->validate([
            'type' => ['required', 'in:up,down']
        ]);

        $user = $request->user();
        $type = $request->type;

        // An anti-gaming boundary: Users cannot artificially pump upvotes on their own posts
        if ($concern->reporter_id === $user->id) {
            return back()->with('error', 'You cannot vote on your own community report submission.');
        }

        // Atomic toggle match check loop
        $existingVote = ConcernVote::where('concern_id', $concern->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingVote) {
            if ($existingVote->vote_type === $type) {
                // If clicking the same option again, treat it as a removal of the vote
                $existingVote->delete();
            } else {
                // If changing minds, swap the internal value
                $existingVote->update(['vote_type' => $type]);
            }
        } else {
            // Spawn brand new database transaction track row record
            ConcernVote::create([
                'id' => Str::uuid()->toString(),
                'concern_id' => $concern->id,
                'user_id' => $user->id,
                'vote_type' => $type,
            ]);
        }

        return back();
    }

    /**
     * Clean Lifecycle Mutator Rule: Revoke or delete report records before review actions occur.
     */
    public function destroy(Request $request, Concern $concern): RedirectResponse
    {
        if ($concern->reporter_id !== $request->user()->id) {
            abort(403, 'Unauthorized row lifecycle action.');
        }

        // Restricts destruction if the concern has already progressed past the initial status
        if ($concern->status !== ConcernStatus::Submitted) {
            return back()->with('error', 'This concern is currently being processed by your barangay team and is locked.');
        }

        DB::transaction(function () use ($concern) {
            // Wipes storage assets from physical disks if matching data structures are purged
            foreach ($concern->media as $mediaItem) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($mediaItem->storage_key);
            }
            $concern->delete();
        });

        return redirect()->route('feed')->with('success', 'Report retracted successfully.');
    }
}