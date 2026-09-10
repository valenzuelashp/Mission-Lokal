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

    public function show(Request $request, Announcement $announcement): Response
    {
        $user = $request->user();

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

    public function volunteer(Request $request, Announcement $announcement): RedirectResponse
    {
        $user = $request->user();

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
