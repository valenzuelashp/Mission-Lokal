<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Support\DemoConcerns;
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
            'concern' => DemoConcerns::detail($concern),
        ]);
    }

    public function vote(Request $request, string $concern): RedirectResponse
    {
        $request->validate([
            'vote' => ['required', 'in:up,down'],
        ]);

        DemoConcerns::vote($concern, $request->string('vote')->toString());

        return back();
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
}
