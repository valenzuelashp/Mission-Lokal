<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resident/Feed', [
            'concerns' => $this->demoConcerns(),
        ]);
    }

    /**
     * Placeholder data until concerns table + API are wired.
     *
     * @return list<array<string, mixed>>
     */
    private function demoConcerns(): array
    {
        return [
            [
                'id' => 'c1',
                'title' => 'Clogged drainage on Mabini Street',
                'category' => 'Infrastructure · Drainage',
                'severity' => 'high',
                'status' => 'active',
                'vote_count' => 12,
                'location_label' => 'Mabini St. corner Rizal Ave.',
                'created_at' => '2 days ago',
                'has_voted' => false,
            ],
            [
                'id' => 'c2',
                'title' => 'Street light not working',
                'category' => 'Infrastructure · Street lights',
                'severity' => 'medium',
                'status' => 'under_review',
                'vote_count' => 5,
                'location_label' => 'Block 3, Phase 2',
                'created_at' => '5 days ago',
                'has_voted' => true,
            ],
            [
                'id' => 'c3',
                'title' => 'Uncollected garbage near market',
                'category' => 'Sanitation · Waste collection',
                'severity' => 'low',
                'status' => 'resolved',
                'vote_count' => 8,
                'location_label' => 'Public market rear entrance',
                'created_at' => '1 week ago',
                'has_voted' => false,
            ],
        ];
    }
}
