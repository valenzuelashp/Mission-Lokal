<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display the flat grid feed matching the ResidentAnnouncement type contract.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        // FIX: Aligned with model 'creator' relationship and table 'body' column naming maps
        $announcements = Announcement::where('barangay_id', $barangayId)
            ->where('is_published', true)
            ->with('creator')
            ->latest('published_at')
            ->get()
            ->map(fn ($item) => [
                'id' => (string) $item->id, // Cast to string to match interface guidelines
                'title' => $item->title,
                'body' => $item->summary ?? substr(strip_tags($item->body), 0, 150) . '...',
                'image_url' => $item->cover_image_url ?? null,
                'published_at' => $item->published_at ? $item->published_at->format('M d, Y') : $item->created_at->format('M d, Y'),
                'author_name' => $item->creator ? ($item->creator->first_name . ' ' . $item->creator->last_name) : 'Barangay Desk',
            ]);

        return Inertia::render('Resident/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    /**
     * Display structural data layout mapped to AnnouncementShowPageProps.
     */
    public function show(Request $request, Announcement $announcement): Response
    {
        if ($announcement->barangay_id !== $request->user()->barangay_id || !$announcement->is_published) {
            abort(404);
        }

        // FIX: Re-load creator context explicitly using correct Eloquent keys
        $announcement->load('creator');

        return Inertia::render('Resident/Announcements/Show', [
            'announcement' => [
                'id' => (string) $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body, // Pass full text block directly into structural view
                'image_url' => $announcement->cover_image_url ?? null,
                'published_at' => $announcement->published_at ? $announcement->published_at->format('F d, Y g:i A') : $announcement->created_at->format('F d, Y'),
                'author_name' => $announcement->creator ? ($announcement->creator->first_name . ' ' . $announcement->creator->last_name) : 'Barangay Desk',
            ]
        ]);
    }
}