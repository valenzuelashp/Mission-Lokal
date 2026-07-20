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

        // 1. Fetch public concerns, eager load relations, and calculate total votes
        $concerns = Concern::with([
                'category', 
                'media', 
                // Eager load ONLY the current user's vote
                'votes' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }
            ])
            // Count upvotes and downvotes separately (matches our new logic)
            ->withCount([
                'votes as upvotes' => fn ($query) => $query->where('vote', 1),
                'votes as downvotes' => fn ($query) => $query->where('vote', -1),
            ])
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
                
                // 2. Format the images
                $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                    return asset('storage/' . $media->storage_key);
                })->toArray();

                // 3. Extract the user's specific vote if it exists
                $userVoteRecord = $concern->votes->first();
                $userVoteStatus = null;
                if ($userVoteRecord) {
                    $userVoteStatus = $userVoteRecord->vote === 1 ? 'up' : 'down';
                }

                // 4. Return exactly what React expects
                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    'category' => $concern->category->name ?? 'Uncategorized', 
                    'status' => $concern->status->value ?? $concern->status, 
                    'address' => $concern->address_text,
                    'created_at' => $concern->created_at->diffForHumans(), 
                    
                    // Pass the separate counts:
                    'upvotes' => (int) $concern->upvotes,
                    'downvotes' => (int) $concern->downvotes,
                    
                    'comments' => 0, // Placeholder
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