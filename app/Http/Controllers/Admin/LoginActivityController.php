<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LoginActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoginActivityController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:128'], 'role' => ['nullable', 'in:personnel,admin'],
            'from' => ['nullable', 'date_format:Y-m-d'], 'to' => ['nullable', 'date_format:Y-m-d'],
        ]);
        $logs = LoginActivity::query()->where('barangay_id', $request->user()->barangay_id)
            ->whereIn('role', ['admin', 'personnel'])
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($q) => $q->where('account_id', 'like', '%'.$search.'%')->orWhere('user_name', 'like', '%'.$search.'%')))
            ->when($filters['role'] ?? null, fn ($query, $role) => $query->where('role', $role))
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('signed_in_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('signed_in_at', '<=', $date))
            ->orderByDesc('signed_in_at')->orderByDesc('id')->paginate(20)->withQueryString();

        return Inertia::render('Admin/LoginActivity', ['logs' => $logs, 'filters' => $filters]);
    }
}
