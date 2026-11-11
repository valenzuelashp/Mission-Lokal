<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardAnalytics;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(Request $request, DashboardAnalytics $analytics): Response
    {
        $barangayId = $request->user()->barangay_id;
        $period = $analytics->period($request);

        return Inertia::render('Admin/Analytics', [
            'analytics' => fn () => $analytics->forBarangay($barangayId, $period),
        ]);
    }
}
