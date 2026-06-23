<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Concern;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function index(): Response
    {
        // 1. Fetch real concerns with their category AND media data!
        $concerns = Concern::with(['category', 'media'])
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
                
                // 2. Generate the array of public URLs for the images
                $concernImages = $concern->media->sortBy('sort_order')->map(function ($media) {
                    return asset('storage/' . $media->storage_key);
                })->toArray();

                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    'category' => $concern->category->name ?? 'Uncategorized', 
                    'status' => $concern->status->value ?? $concern->status, 
                    'address' => $concern->address_text,
                    'created_at' => $concern->created_at->diffForHumans(), 
                    'upvotes' => 0, 
                    'comments' => 0,
                    'is_resolved' => $concern->status === 'resolved',
                    
                    // 3. Inject the real images into the feed data!
                    'images' => $concernImages,
                ];
            });

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
        ]);
    }
}