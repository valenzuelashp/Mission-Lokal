<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\User;
use App\Enums\UserRole;
use App\Services\LocalIdentifier;
use App\Mail\PrimaryAdminCredentials;
use App\Mail\ViewOnlyAdminCredentials;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
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

                $viewOnlyAdmins = User::where('barangay_id', $b->id)
                    ->where('role', UserRole::Admin)
                    ->where('is_view_only', true)
                    ->get()
                    ->map(fn($va) => [
                        'name' => trim($va->first_name . ' ' . $va->last_name),
                        'email' => $va->email,
                        'account_id' => $va->account_id,
                    ]);

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
                    'view_only_admins' => $viewOnlyAdmins,
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
        ]);

        $rawPassword = '';
        $accountId = '';

        DB::transaction(function () use ($validated, &$rawPassword, &$accountId) {
            $cityClean = preg_replace('/(CITY|MUNICIPALITY|PROVINCE)/i', '', $validated['city']);
            $cityNormalized = \Illuminate\Support\Str::ascii(trim($cityClean));
            $cityUpper = strtoupper(preg_replace('/[^a-zA-Z]/', '', $cityNormalized));
            $cityNoVowels = preg_replace('/[AEIOU]/', '', $cityUpper);
            $cityCode = substr($cityNoVowels, 0, 4);

            $brgyName = trim($validated['barangay_name']);
            if (preg_match('/(\d+)/', $brgyName, $matches)) {
                $brgyCode = 'B' . $matches[1];
            } else {
                $brgyNoPrefix = preg_replace('/^(barangay|brgy)\.?\s*/i', '', $brgyName);
                $brgyClean = strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $brgyNoPrefix));
                $brgyCode = substr($brgyClean, 0, 6) ?: 'BRGY';
            }

            $code = "{$cityCode}-{$brgyCode}";

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

            $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['admin_last_name']);
            $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Admin'));
            
            $rawPassword = $code . '!' . $readableLastName;

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $accountId,
                'role' => UserRole::Admin,
                'is_view_only' => false,
                'first_name' => $validated['admin_first_name'],
                'last_name' => $validated['admin_last_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]);
        });

        $adminPayload = [
            'account_id' => $accountId,
            'name' => trim($validated['admin_first_name'] . ' ' . $validated['admin_last_name']),
            'email' => $validated['admin_email'],
            'password' => $rawPassword,
            'title' => 'Primary Administrator Created & Emailed!',
        ];

        try {
            Mail::to($validated['admin_email'])->send(new PrimaryAdminCredentials($adminPayload));
        } catch (\Exception $e) {
            // Suppress mail error
        }

        return back()->with([
            'success' => 'Barangay node and primary admin successfully provisioned and emailed.',
            'new_view_only_credentials' => $adminPayload
        ]);
    }

    public function storeViewOnlyAdmin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barangay_id' => ['required', 'exists:barangays,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        $rawPassword = '';
        $accountId = '';

        DB::transaction(function () use ($validated, &$rawPassword, &$accountId) {
            $barangay = Barangay::findOrFail($validated['barangay_id']);
            $accountId = LocalIdentifier::next($barangay, LocalIdentifier::ADM);

            $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['last_name']);
            $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Official'));
            
            $rawPassword = $barangay->code . '!' . $readableLastName;

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $accountId,
                'role' => UserRole::Admin,
                'is_view_only' => true,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]);
        });

        $viewOnlyPayload = [
            'account_id' => $accountId,
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'password' => $rawPassword,
            'title' => 'View-Only Account Created & Emailed!',
        ];

        try {
            Mail::to($validated['email'])->send(new ViewOnlyAdminCredentials($viewOnlyPayload));
        } catch (\Exception $e) {
            // Suppress mail error
        }

        return back()->with([
            'success' => 'View-only monitoring account successfully created and emailed.',
            'new_view_only_credentials' => $viewOnlyPayload
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barangay = Barangay::findOrFail($id);

        $validated = $request->validate([
            'house_street' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:100'],
            'contact_phone' => ['nullable', 'string', 'max:50'],
            'contact_email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $barangay->update($validated);

        return back()->with('success', 'Barangay node contact properties updated successfully.');
    }
}