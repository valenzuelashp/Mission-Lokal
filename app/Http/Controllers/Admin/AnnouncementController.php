<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Display a multi-tenant scoped roster of all broadcasted announcements.
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        $announcements = Announcement::with('creator')
            ->where('barangay_id', $barangayId)
            ->latest()
            ->get()
            ->map(function ($item) {
                $authorName = $item->creator 
                    ? trim($item->creator->first_name . ' ' . $item->creator->last_name) 
                    : 'Barangay Admin';

                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'body' => $item->body, 
                    'category' => $item->category ?? 'General',
                    'is_published' => (bool)($item->is_published ?? true),
                    'author_name' => $authorName, 
                    'image_url' => $item->cover_image_url ? Storage::url($item->cover_image_url) : null,
                    'created_at' => $item->created_at ? $item->created_at->format('M d, Y h:i A') : 'Recently',
                ];
            });

        $counts = [
            'all' => $announcements->count(),
            'published' => $announcements->where('is_published', true)->count(),
            'draft' => $announcements->where('is_published', false)->count(),
        ];

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements->values()->toArray(),
            'counts' => $counts,
        ]);
    }

    /**
     * Show the form for generating a new broadcast alert.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Announcements/Create');
    }

    /**
     * Store a new announcement record bound to the tenant context.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'is_published' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'], // Max 5MB file size constraint
        ]);

        $barangayId = $request->user()->barangay_id;
        $isPublished = $request->is_published ?? false;

        // Process incoming cover photo files safely
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('announcements', 'public');
        }

        $announcement = Announcement::create([
            'barangay_id' => $barangayId,
            'title' => $request->title,
            'body' => $request->body, 
            'cover_image_url' => $imagePath,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
            'created_by' => Auth::id(),
        ]);

        // Post record addition parameters to security trail logs
        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'CREATE',
            'entity_type' => 'Announcement',
            'entity_id' => $announcement->id,
            'metadata' => json_encode(['details' => 'Broadcasted announcement advisory: ' . $request->title]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement published and broadcasted to residents.');
    }

    /**
     * Show the form for editing an existing alert entry.
     */
    public function edit(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;
        $announcement = Announcement::where('barangay_id', $barangayId)->findOrFail($id);

        return Inertia::render('Admin/Announcements/Edit', [
            'announcement' => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'category' => $announcement->category ?? 'General',
                'is_published' => (bool)$announcement->is_published,
                'image_url' => $announcement->cover_image_url ? Storage::url($announcement->cover_image_url) : null,
            ]
        ]);
    }

    /**
     * Update an active announcement's structural values.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $announcement = Announcement::where('barangay_id', $barangayId)->findOrFail($id);

        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:50'],
            'is_published' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $isPublished = $request->is_published ?? false;
        $imagePath = $announcement->cover_image_url;

        // Manage old file deletion if requested or replaced
        if ($request->boolean('remove_image') && $announcement->cover_image_url) {
            Storage::disk('public')->delete($announcement->cover_image_url);
            $imagePath = null;
        }

        if ($request->hasFile('image')) {
            if ($announcement->cover_image_url) {
                Storage::disk('public')->delete($announcement->cover_image_url);
            }
            $imagePath = $request->file('image')->store('announcements', 'public');
        }

        $announcement->update([
            'title' => $request->title,
            'body' => $request->body,
            'category' => $request->category ?? 'General',
            'cover_image_url' => $imagePath,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? ($announcement->published_at ?? now()) : null,
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'UPDATE',
            'entity_type' => 'Announcement',
            'entity_id' => $announcement->id,
            'metadata' => json_encode(['details' => 'Modified announcement advisory content parameters for: ' . $request->title]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement entry updated successfully.');
    }

    /**
     * Remove a broadcast notice permanently from the system registry.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $announcement = Announcement::where('barangay_id', $barangayId)->findOrFail($id);
        
        $savedTitle = $announcement->title;
        $savedId = $announcement->id;

        // Clean up stored image asset from local disk space before record drop
        if ($announcement->cover_image_url) {
            Storage::disk('public')->delete($announcement->cover_image_url);
        }
        
        $announcement->delete();

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'DELETE',
            'entity_type' => 'Announcement',
            'entity_id' => $savedId,
            'metadata' => json_encode(['details' => 'Permanently dropped announcement archive entry: ' . $savedTitle]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->route('admin.announcements.index')
            ->with('success', 'Announcement permanently removed.');
    }
}