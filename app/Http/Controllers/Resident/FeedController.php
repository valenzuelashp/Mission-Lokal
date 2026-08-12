<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Concern;
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
            // FIX: Match the new 'up' and 'down' strings in the database
            ->withCount([
                'votes as upvotes' => fn ($query) => $query->where('vote', 'up'),
                'votes as downvotes' => fn ($query) => $query->where('vote', 'down'),
            ])
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
                
                // FIX: Added ->values() to force a clean JSON array for React's .length check
                $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                    return asset('storage/' . $media->storage_key);
                })->values()->toArray(); 

                // FIX: Use the string value directly since the DB no longer uses integers
                $userVoteRecord = $concern->votes->first();
                $userVoteStatus = $userVoteRecord ? $userVoteRecord->vote : null;

                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    'category' => $concern->category->name ?? 'Uncategorized', 
                    'status' => $concern->status->value ?? $concern->status, 
                    // FIX: Renamed 'address' to 'location_label' to match ConcernCard.tsx
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

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
        ]);
    }
}