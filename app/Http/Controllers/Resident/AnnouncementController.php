<?php

namespace App\Http\Controllers\Resident;

use App\Enums\AnnouncementKind;
use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\AnnouncementVolunteer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $announcements = $this->publishedQuery($user->barangay_id, $user->id)
            ->latest('published_at')
            ->get()
            ->map(fn (Announcement $item) => $item->toResidentArray($user->id));

        return Inertia::render('Resident/Announcements', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();

        // 1. Handle demo announcements (e.g. IDs starting with 'ann-')
        if (str_starts_with($id, 'ann-')) {
            $demoAnnouncements = [
                [
                    'id' => 'ann-001',
                    'title' => 'Typhoon season preparedness advisory',
                    'body' => "Barangay residents are advised to prepare emergency kits and monitor PAGASA updates. Evacuation centers will open at the covered court 2 hours before signal hoisting.\n\nPlease secure outdoor loose items, clear drainage paths around your property line, and keep emergency contact numbers handy. Hotline: 8888-TAMBO.",
                    'published_at' => 'Jun 16, 8:00 AM',
                    'event_at' => null,
                    'author_name' => 'Barangay Captain Mateo Dela Cruz',
                    'volunteer_count' => 14,
                    'has_joined' => false,
                    'kind' => 'advisory',
                    'kind_label' => 'Advisory',
                    'image_url' => null,
                ],
                [
                    'id' => 'ann-002',
                    'title' => 'Scheduled water interruption — Zone 3 & 4',
                    'body' => "Maynilad will conduct pipeline maintenance on Jun 18 from 9:00 AM to 4:00 PM.\n\nAffected areas: Riverside Ave., Block 8–12. Please store sufficient water ahead of time.",
                    'published_at' => 'Jun 15, 2:30 PM',
                    'event_at' => 'Jun 18, 9:00 AM',
                    'author_name' => 'Bantay Tubig Task Force',
                    'volunteer_count' => 5,
                    'has_joined' => false,
                    'kind' => 'advisory',
                    'kind_label' => 'Advisory',
                    'image_url' => null,
                ],
            ];

            $found = collect($demoAnnouncements)->firstWhere('id', $id);
            if ($found) {
                return Inertia::render('Resident/Announcements/Show', [
                    'announcement' => $found,
                ]);
            }
            abort(404);
        }

        // 2. Handle actual Database records
        $announcement = Announcement::findOrFail($id);

        if ($announcement->barangay_id !== $user->barangay_id || ! $announcement->is_published) {
            abort(404);
        }

        $announcement->load('creator');
        $announcement->loadCount('volunteers');
        $announcement->setAttribute(
            'joined',
            $announcement->volunteers()->where('user_id', $user->id)->exists(),
        );

        return Inertia::render('Resident/Announcements/Show', [
            'announcement' => $announcement->toResidentArray($user->id, true),
        ]);
    }

    public function volunteer(Request $request, string $id): RedirectResponse
    {
        $user = $request->user();

        // If it's a demo announcement, just simulate success redirect
        if (str_starts_with($id, 'ann-')) {
            return back()->with('success', 'Volunteer status updated successfully (Demo Mode).');
        }

        $announcement = Announcement::findOrFail($id);

        if ($announcement->barangay_id !== $user->barangay_id || ! $announcement->is_published) {
            abort(404);
        }

        if ($announcement->resolvedKind() !== AnnouncementKind::Volunteer) {
            return back()->with('error', 'This post is not asking for volunteers.');
        }

        $existing = AnnouncementVolunteer::query()
            ->where('announcement_id', $announcement->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();

            return back()->with('success', 'You left this volunteer call.');
        }

        AnnouncementVolunteer::create([
            'announcement_id' => $announcement->id,
            'user_id' => $user->id,
        ]);

        return back()->with('success', 'You are on the volunteer list. Salamat!');
    }

    private function publishedQuery(string $barangayId, string $viewerId)
    {
        return Announcement::query()
            ->where('barangay_id', $barangayId)
            ->where('is_published', true)
            ->with('creator')
            ->withCount('volunteers')
            ->withExists([
                'volunteers as joined' => fn ($query) => $query->where('user_id', $viewerId),
            ]);
    }
}