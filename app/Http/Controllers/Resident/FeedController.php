<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Support\DemoConcerns;
use Inertia\Inertia;
use Inertia\Response;

class FeedController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Resident/Feed', [
            'concerns' => DemoConcerns::all(),
        ]);
    }
}
