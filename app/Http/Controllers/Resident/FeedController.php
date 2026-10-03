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
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
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

        // Query real database announcements for the sidebar
        $announcements = Announcement::query()
            ->where('barangay_id', $user->barangay_id)
            ->where('is_published', true)
            ->with('creator')
            ->withCount('volunteers')
            ->withExists([
                'volunteers as joined' => fn ($query) => $query->where('user_id', $user->id),
            ])
            ->latest('published_at')
            ->take(2)
            ->get()
            ->map(fn (Announcement $item) => $item->toResidentArray($user->id));

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
            'announcements' => $announcements,
        ]);
    }
}