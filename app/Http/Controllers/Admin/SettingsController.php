<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display the settings management view populated with tenant contexts.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $barangay = DB::table('barangays')->where('id', $user->barangay_id)->first();

        return Inertia::render('Admin/Settings', [
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
            ],
            'barangay' => [
                'name' => $barangay->name ?? 'Localized Container Node',
                'office_address' => $barangay->office_address ?? 'Barangay Hall Complex',
            ]
        ]);
    }

    /**
     * Update the administrator's account information profile details.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
        ]);

        DB::table('users')->where('id', $user->id)->update([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'updated_at' => now(),
        ]);

        // Audit Logging Integration (Task A12)
        DB::table('audit_logs')->insert([
            'barangay_id' => $user->barangay_id,
            'actor_id' => $user->id,
            'action' => 'UPDATE',
            'entity_type' => 'AdminProfile',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Modified core administrative account contact properties.']),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Profile configuration settings updated successfully.');
    }

    /**
     * Alter security credentials with mandatory rule enforcement.
     */
    public function updateSecurity(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required', 
                'confirmed', 
                // ENFORCE MANDATE: 8+ characters, 1 number, 1 symbol
                Password::min(8)->numbers()->symbols()
            ],
        ]);

        DB::table('users')->where('id', $user->id)->update([
            'password' => Hash::make($request->password),
            'updated_at' => now(),
        ]);

        // Audit Logging Integration (Task A12)
        DB::table('audit_logs')->insert([
            'barangay_id' => $user->barangay_id,
            'actor_id' => $user->id,
            'action' => 'UPDATE',
            'entity_type' => 'AdminSecurity',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Updated account security access keys under system configuration complexity validation checks.']),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return back()->with('success', 'Security credentials updated successfully.');
    }
}