<?php

namespace App\Http\Controllers\Resident;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginActivityController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $logs = LoginActivity::query()
            ->where('user_id', $request->user()->id)
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('signed_in_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('signed_in_at', '<=', $date))
            ->orderByDesc('signed_in_at')->orderByDesc('id')
            ->paginate(10, ['id', 'signed_in_at', 'ip_address', 'browser', 'device', 'approximate_location'])
            ->appends($filters);

        return Inertia::render('Resident/Profile/LoginActivity', ['logs' => $logs, 'filters' => $filters]);
    }
}
