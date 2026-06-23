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
        // 1. Fetch real concerns with their category data
        $concerns = Concern::with('category')
            ->where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    
                    // Use the real category name!
                    'category' => $concern->category->name ?? 'Uncategorized', 
                    
                    'status' => $concern->status->value ?? $concern->status, 
                    'address' => $concern->address_text,
                    'created_at' => $concern->created_at->diffForHumans(), 
                    'upvotes' => 0, 
                    'comments' => 0,
                    'is_resolved' => $concern->status === 'resolved',
                ];
            });

        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
        ]);
    }
}