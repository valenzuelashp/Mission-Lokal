<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\User;
use App\Enums\UserRole;
use App\Services\LocalIdentifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BarangayManagementController extends Controller
{
    public function dashboard(Request $request): Response
    {
        $totalBarangays = Barangay::count();
        $totalUsers = User::count();
        $totalConcerns = DB::table('concerns')->count();
        $activeMissions = DB::table('missions')->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])->count();

        $recentBarangays = Barangay::withCount(['users', 'concerns'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($b) {
                return [
                    'id' => $b->id,
                    'name' => $b->name,
                    'code' => $b->code,
                    'users_count' => $b->users_count,
                    'concerns_count' => $b->concerns_count,
                    'is_active' => (bool) $b->is_active,
                    'created_at' => $b->created_at?->format('M d, Y'),
                ];
            });

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'total_barangays' => $totalBarangays,
                'total_users' => $totalUsers,
                'total_concerns' => $totalConcerns,
                'active_missions' => $activeMissions,
            ],
            'recent_barangays' => $recentBarangays,
        ]);
    }

    public function index(Request $request): Response
    {
        $barangays = Barangay::withCount(['users', 'concerns'])
            ->latest()
            ->get()
            ->map(function ($b) {
                $primaryAdmin = User::where('barangay_id', $b->id)
                    ->where('role', UserRole::Admin)
                    ->where('is_view_only', false)
                    ->first();

                return [
                    'id' => $b->id,
                    'code' => $b->code,
                    'name' => $b->name,
                    'house_street' => $b->house_street ?? '',
                    'city' => $b->city ?? '',
                    'province' => $b->province ?? '',
                    'contact_phone' => $b->contact_phone ?? 'N/A',
                    'contact_email' => $b->contact_email ?? 'N/A',
                    'is_active' => (bool) $b->is_active,
                    'users_count' => $b->users_count,
                    'concerns_count' => $b->concerns_count,
                    'primary_admin' => $primaryAdmin ? [
                        'name' => trim($primaryAdmin->first_name . ' ' . $primaryAdmin->last_name),
                        'email' => $primaryAdmin->email,
                        'account_id' => $primaryAdmin->account_id,
                    ] : null,
                    'created_at' => $b->created_at?->format('M d, Y'),
                ];
            });

        return Inertia::render('SuperAdmin/Barangays/Index', [
            'barangays' => $barangays,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barangay_name' => ['required', 'string', 'max:255'],
            'house_street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'admin_first_name' => ['required', 'string', 'max:255'],
            'admin_last_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'admin_password' => ['required', 'string', 'min:8'],
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Remove vowels from City name (e.g. Paranaque -> PRNQ)
            $cityUpper = strtoupper(preg_replace('/[^a-zA-Z]/', '', $validated['city']));
            $cityNoVowels = preg_replace('/[AEIOU]/', '', $cityUpper);
            $cityCode = substr($cityNoVowels, 0, 4);

            // 2. Format Barangay name/number (e.g. Barangay 36 -> B36)
            $brgyName = trim($validated['barangay_name']);
            if (preg_match('/(\d+)/', $brgyName, $matches)) {
                $brgyCode = 'B' . $matches[1];
            } else {
                $brgyClean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $brgyName));
                $brgyCode = substr($brgyClean, 0, 6);
            }

            $code = "{$cityCode}-{$brgyCode}";

            // Ensure absolute uniqueness
            if (Barangay::where('code', $code)->exists()) {
                $code .= '-' . strtoupper(Str::random(3));
            }

            $barangay = Barangay::create([
                'id' => (string) Str::uuid(),
                'code' => $code,
                'name' => $validated['barangay_name'],
                'house_street' => $validated['house_street'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'contact_phone' => $validated['contact_phone'] ?? null,
                'contact_email' => $validated['contact_email'] ?? null,
                'is_active' => true,
            ]);

            $accountId = LocalIdentifier::next($barangay, LocalIdentifier::ADM);

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $accountId,
                'role' => UserRole::Admin,
                'is_view_only' => false,
                'first_name' => $validated['admin_first_name'],
                'last_name' => $validated['admin_last_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'is_active' => true,
            ]);
        });

        return back()->with('success', 'Barangay node and primary admin successfully provisioned.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barangay = Barangay::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'house_street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $barangay->update($validated);

        return back()->with('success', 'Barangay node properties updated successfully.');
    }
}