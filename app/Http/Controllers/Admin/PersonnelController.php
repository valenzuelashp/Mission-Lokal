<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Enums\PersonnelCategory;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PersonnelController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;

        // Auto-heal: Ensure all users with role 'personnel' have a corresponding personnel extension record
        $personnelUsers = User::where('barangay_id', $barangayId)
            ->where('role', 'personnel')
            ->get();

        foreach ($personnelUsers as $user) {
            Personnel::firstOrCreate(
                ['user_id' => $user->id],
                ['is_active' => $user->is_active]
            );
        }

        // Generate the next incremental Account ID (e.g., PER001, PER002)
        $lastPersonnel = User::where('barangay_id', $barangayId)
            ->where('role', 'personnel')
            ->where('account_id', 'like', 'PER%')
            ->orderByRaw('CAST(SUBSTRING(account_id, 4) AS UNSIGNED) DESC')
            ->first();

        $nextIdNumber = 1;
        if ($lastPersonnel) {
            $lastNumber = (int) substr($lastPersonnel->account_id, 3);
            $nextIdNumber = $lastNumber + 1;
        }
        $nextAccountId = 'PER' . str_pad($nextIdNumber, 3, '0', STR_PAD_LEFT);

        $personnel = Personnel::with('user')
            ->whereHas('user', function ($q) use ($barangayId) {
                $q->where('barangay_id', $barangayId)
                  ->where('role', 'personnel');
            })
            ->latest()
            ->get()
            ->map(function ($p) {
                $fullName = trim(sprintf(
                    '%s %s %s %s',
                    $p->user?->first_name ?? '',
                    $p->user?->middle_name ?? '',
                    $p->user?->last_name ?? '',
                    $p->user?->name_extension ?? ''
                ));

                return [
                    'id' => $p->id,
                    'account_id' => $p->user?->account_id,
                    'category' => $p->category?->label(),
                    'category_value' => $p->category?->value,
                    'first_name' => $p->user?->first_name,
                    'middle_name' => $p->user?->middle_name,
                    'last_name' => $p->user?->last_name,
                    'name_extension' => $p->user?->name_extension,
                    'name' => preg_replace('/\s+/', ' ', $fullName),
                    'birthday' => $p->birthday?->format('M d, Y'),
                    'email' => $p->user?->email,
                    'mobile' => $p->user?->mobile,
                    'is_active' => (bool)($p->user?->is_active ?? $p->is_active),
                    'created_at' => $p->user?->created_at?->format('M d, Y') ?? $p->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/Personnel/Index', [
            'personnel' => $personnel,
            'next_account_id' => $nextAccountId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_id' => ['required', 'string', 'max:64', 'unique:users,account_id'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:20'],
            'birthday' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:6'],
            'category' => ['required', 'string', 'in:' . implode(',', array_column(PersonnelCategory::cases(), 'value'))],
        ]);

        $barangayId = $request->user()->barangay_id;

        DB::transaction(function () use ($validated, $barangayId, $request) {
            $user = User::create([
                'barangay_id' => $barangayId,
                'account_id' => $validated['account_id'],
                'role' => 'personnel',
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'name_extension' => $validated['name_extension'] ?? null,
                'email' => $validated['email'] ?? null,
                'mobile' => $validated['mobile'] ?? null,
                'password' => Hash::make($validated['password']),
                // Removed verification_status since it no longer exists on users table
                'is_active' => 1,
            ]);

            $personnel = Personnel::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'birthday' => $validated['birthday'] ?? null,
                'category' => $validated['category'],
                'is_active' => 1,
            ]);

            $fullName = trim("{$validated['first_name']} {$validated['last_name']}");

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CREATE',
                'entity_type' => 'Personnel',
                'entity_id' => $personnel->id,
                'metadata' => json_encode(['details' => 'Created personnel account: ' . $fullName]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Personnel account successfully created!');
    }

    public function updateCategory(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:' . implode(',', array_column(PersonnelCategory::cases(), 'value'))],
        ]);

        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !== $request->user()->barangay_id) {
            abort(403);
        }

        $personnel->update(['category' => $validated['category']]);

        return back()->with('success', 'Personnel category updated successfully.');
    }

    public function updateInformation(Request $request, string $id): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:' . implode(',', array_column(PersonnelCategory::cases(), 'value'))],
            'birthday' => ['nullable', 'date'],
            'email' => ['nullable', 'email', 'max:255'],
            'mobile' => ['nullable', 'string', 'max:20'],
            'status' => ['required', 'in:active,inactive'],
        ]);

        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !== $request->user()->barangay_id) {
            abort(403);
        }

        DB::transaction(function () use ($personnel, $validated) {
            $personnel->update([
                'category' => $validated['category'],
                'birthday' => $validated['birthday'] ?? null,
                'is_active' => $validated['status'] === 'active',
            ]);

            $personnel->user->update([
                'email' => $validated['email'] ?? null,
                'mobile' => $validated['mobile'] ?? null,
                'is_active' => $validated['status'] === 'active',
            ]);
        });

        return back()->with('success', 'Personnel information updated successfully.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $barangayId = $request->user()->barangay_id;
        $personnel = Personnel::with('user')->findOrFail($id);

        if ($personnel->user->barangay_id !== $barangayId) {
            abort(403);
        }

        DB::transaction(function () use ($personnel, $barangayId, $request) {
            $name = trim(($personnel->user->first_name ?? '') . ' ' . ($personnel->user->last_name ?? ''));
            $user = $personnel->user;
            
            $user->delete();

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'DELETE',
                'entity_type' => 'Personnel',
                'entity_id' => $personnel->id,
                'metadata' => json_encode(['details' => 'Deleted personnel account: ' . $name]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);
        });

        return back()->with('success', 'Personnel account successfully removed.');
    }
}