<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\CalendarService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request, CalendarService $calendar): Response
    {
        return Inertia::render('Admin/Calendar', $calendar->monthFor(
            $request->user(),
            $request->integer('year') ?: null,
            $request->integer('month') ?: null,
        ));
    }
}
