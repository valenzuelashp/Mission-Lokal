<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConcernController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Resident/Concerns/New', [
            'categories' => $this->categories(),
            'mapCenter' => [14.5995, 120.9842],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'category' => ['required', 'string'],
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
        ]);

        return redirect()
            ->route('feed')
            ->with('success', 'Concern submitted! Backend will save to database in a future task.');
    }

    public function show(string $concern): Response
    {
        return Inertia::render('Resident/Concerns/Show', [
            'concern' => $this->demoConcern($concern),
        ]);
    }

    /** @return list<array{value: string, label: string}> */
    private function categories(): array
    {
        return [
            ['value' => 'drainage', 'label' => 'Infrastructure · Clogged drainage'],
            ['value' => 'street_light', 'label' => 'Infrastructure · Street light'],
            ['value' => 'waste', 'label' => 'Sanitation · Uncollected waste'],
            ['value' => 'noise', 'label' => 'Sanitation · Noise complaint'],
            ['value' => 'road', 'label' => 'Infrastructure · Damaged roads'],
            ['value' => 'safety', 'label' => 'Public safety · Other'],
        ];
    }

    /** @return array<string, mixed> */
    private function demoConcern(string $id): array
    {
        return [
            'id' => $id,
            'title' => 'Clogged drainage on Mabini Street',
            'category' => 'Infrastructure · Drainage',
            'severity' => 'high',
            'status' => 'active',
            'vote_count' => 12,
            'location_label' => 'Mabini St. corner Rizal Ave.',
            'created_at' => '2 days ago',
            'description' => 'Water accumulates after rain and blocks the sidewalk. Residents have difficulty passing, especially seniors and children.',
            'timeline' => [
                ['key' => 'submitted', 'label' => 'Submitted', 'at' => 'Jun 15, 10:30 AM', 'state' => 'done'],
                ['key' => 'ai', 'label' => 'AI processed', 'description' => 'Category & severity suggested', 'at' => 'Jun 15, 10:31 AM', 'state' => 'done'],
                ['key' => 'review', 'label' => 'Under review', 'description' => 'Staff reviewing report', 'at' => 'Jun 15, 2:00 PM', 'state' => 'done'],
                ['key' => 'active', 'label' => 'Being addressed', 'description' => 'Mission assigned to personnel', 'state' => 'current'],
                ['key' => 'resolved', 'label' => 'Resolved', 'state' => 'upcoming'],
            ],
        ];
    }
}
