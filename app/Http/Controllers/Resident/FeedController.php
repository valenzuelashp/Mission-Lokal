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
        // 1. Fetch real concerns from the database
        // We only want 'public' ones, and we want the newest ones first
        $concerns = Concern::where('visibility', 'public')
            ->latest()
            ->get()
            ->map(function ($concern) {
                // 2. Format the data so your React frontend understands it
                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'description' => $concern->description,
                    'category' => 'General', // We will link real categories later!
                    
                    // Handle the strict Enum status
                    'status' => $concern->status->value ?? $concern->status, 
                    
                    'address' => $concern->address_text,
                    'created_at' => $concern->created_at->diffForHumans(), // Turns date into "2 hours ago"
                    
                    // Temporary defaults for the UI until we build voting
                    'upvotes' => 0, 
                    'comments' => 0,
                    'is_resolved' => $concern->status === 'resolved',
                ];
            });

        // 3. Send the real database records to the React UI!
        return Inertia::render('Resident/Feed', [
            'concerns' => $concerns,
        ]);
    }
}