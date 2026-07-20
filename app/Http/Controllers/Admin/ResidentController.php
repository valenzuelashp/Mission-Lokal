<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ResidentController extends Controller
{
    /**
     * Display the dynamic directory roster of local residents (Task A7)
     */
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        $search = $request->input('search');

        $query = User::where('barangay_id', $barangayId)
            ->where('role', 'resident');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('account_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $residents = $query->latest()->get()->map(function ($user) {
            $status = $user->verification_status?->value ?? $user->verification_status ?? 'unverified';
            // Fallback for UI mapping to match 'approved' tabs vs 'verified' labels
            if ($status === 'verified') {
                $status = 'approved';
            }

            return [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'full_name' => trim($user->first_name . ' ' . $user->last_name),
                'email' => $user->email ?? '—',
                'mobile' => $user->mobile ?? '—',
                'address' => $user->address ?? 'No address listed',
                'verification_status' => $status,
                'civic_xp' => (int)($user->civic_xp ?? 0),
                'badge_count' => (int)($user->badge_count ?? 0),
                'joined_at' => $user->created_at ? $user->created_at->format('M d, Y') : 'Unknown',
            ];
        });

        // Generate counts mapping exactly to keys in tabs array
        $counts = [
            'all' => $residents->count(),
            'approved' => $residents->where('verification_status', 'approved')->count(),
            'in_progress' => $residents->where('verification_status', 'in_progress')->count(),
            'pending' => $residents->where('verification_status', 'pending')->count(),
            'rejected' => $residents->where('verification_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Residents/Index', [
            'residents' => $residents->values(),
            'counts' => $counts,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display comprehensive resource file card for a single citizen (Task A8)
     */
    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;

        $user = User::where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->with(['residentProfile', 'concerns' => function($q) {
                $q->latest()->limit(5);
            }])
            ->findOrFail($id);

        // Fetch spatial coordinates cleanly
        $coords = \App\Models\Concern::selectRaw('ST_Y(location) as lat, ST_X(location) as lng')
            ->where('reporter_id', $user->id)
            ->first();

        $profileDetail = [
            'id' => $user->id,
            'account_id' => $user->account_id,
            'full_name' => trim($user->first_name . ' ' . $user->last_name),
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_name' => $user->middle_name ?? '',
            'email' => $user->email ?? '—',
            'mobile' => $user->mobile ?? '—',
            'birthday' => $user->birthday ? \Carbon\Carbon::parse($user->birthday)->format('M d, Y') : '—',
            'age_years' => $user->birthday ? \Carbon\Carbon::parse($user->birthday)->age : null,
            'address' => $user->address ?? 'No physical address listed',
            'zip_code' => $user->zip_code ?? null,
            'verification_status' => $user->verification_status?->value ?? $user->verification_status ?? 'unverified',
            'national_id_masked' => $user->id_number ? mask_string($user->id_number) : '—',
            'citizenship_status' => $user->citizenship_status ?? 'Citizen',
            'gender' => $user->gender ?? 'Not specified',
            'civic_xp' => (int)($user->civic_xp ?? 0),
            'badge_count' => (int)($user->badge_count ?? 0),
            'map_lat' => $coords->lat ?? 14.65,
            'map_lng' => $coords->lng ?? 120.98,
            'emergency_contact' => $user->emergency_contact ? json_decode($user->emergency_contact, true) : null,
            'activities' => $user->concerns->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'status' => $concern->status->value ?? $concern->status,
                    'created_at' => $concern->created_at ? $concern->created_at->format('M d, Y') : 'Just now',
                ];
            })->toArray(),
            'documents' => [], // Populate with uploaded clearances or documents relationship array if present
        ];

        return Inertia::render('Admin/Residents/Show', [
            'resident' => $profileDetail,
        ]);
    }
}

/**
 * Mask sensitive data helper function logic
 */
if (!function_exists('mask_string')) {
    function mask_string($string) {
        return (strlen($string) > 4) ? str_repeat('*', strlen($string) - 4) . substr($string, -4) : $string;
    }
}