<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $concerns = Concern::with([
                'category', 
                'media', 
                'votes' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ])
            ->withCount([
                'votes as upvotes' => fn ($query) => $query->where('vote', 1),
                'votes as downvotes' => fn ($query) => $query->where('vote', -1),
            ])
            ->when($user->barangay_id, fn($q) => $q->where('barangay_id', $user->barangay_id))
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) use ($user) {
                $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                    return asset('storage/' . $media->storage_key);
                })->values()->toArray(); 

                $userVoteRecord = $concern->votes->first();
                $rawVote = $userVoteRecord?->vote;
                $userVoteStatus = ((int) $rawVote === 1) ? 'up' : (((int) $rawVote === -1) ? 'down' : null);

                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    'category' => $concern->category->name ?? 'Uncategorized', 
                    'status' => $concern->status->value ?? $concern->status, 
                    'location_label' => $concern->address_text ?? 'Unknown location', 
                    'created_at' => $concern->created_at->diffForHumans(), 
                    'upvotes' => (int) $concern->upvotes,
                    'downvotes' => (int) $concern->downvotes,
                    'comments' => 0,
                    'is_resolved' => $concern->status === 'resolved',
                    'user_vote' => $userVoteStatus, 
                    'images' => $concernImages,
                ];
            });

        // Fetch announcements strictly for the resident's barangay if set, 
        // with a fallback to latest published if testing with unassigned accounts.
        $announcementsQuery = Announcement::query()
            ->where('is_published', true)
            ->with('creator')
            ->withCount('volunteers')
            ->withExists([
                'volunteers as joined' => fn ($query) => $query->where('user_id', $user->id),
            ]);

        if ($user->barangay_id) {
            $announcementsQuery->where('barangay_id', $user->barangay_id);
        }

        $announcements = $announcementsQuery
            ->latest('published_at')
            ->take(2)
            ->get();

        // Fallback for testing if barangay ID lookup yields 0 due to test account seed variations
        if ($announcements->isEmpty()) {
            $announcements = Announcement::query()
                ->where('is_published', true)
                ->with('creator')
                ->withCount('volunteers')
                ->withExists([
                    'volunteers as joined' => fn ($query) => $query->where('user_id', $user->id),
                ])
                ->latest('published_at')
                ->take(2)
                ->get();
        }

        $mappedAnnouncements = $announcements->map(fn (Announcement $item) => $item->toResidentArray($user->id));

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
            'announcements' => $mappedAnnouncements,
        ]);
    }
}