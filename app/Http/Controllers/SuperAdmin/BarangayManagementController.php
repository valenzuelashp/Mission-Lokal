<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\User;
use App\Enums\AdminType;
use App\Enums\UserRole;
use App\Services\LocalIdentifier;
use App\Mail\PrimaryAdminCredentials;
use App\Mail\ViewOnlyAdminCredentials;
use Illuminate\Mail\Mailable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
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
                    ->where('admin_type', AdminType::General->value)
                    ->where('is_view_only', false)
                    ->first();
                $radioRoomAdmin = User::where('barangay_id', $b->id)
                    ->where('role', UserRole::Admin)
                    ->where('admin_type', AdminType::RadioRoom->value)
                    ->where('is_view_only', false)
                    ->first();

                $viewOnlyAdmins = User::where('barangay_id', $b->id)
                    ->where('role', UserRole::Admin)
                    ->where('is_view_only', true)
                    ->get()
                    ->map(fn($va) => [
                        'id' => $va->id,
                        'first_name' => $va->first_name,
                        'last_name' => $va->last_name,
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
                        'id' => $primaryAdmin->id,
                        'first_name' => $primaryAdmin->first_name,
                        'last_name' => $primaryAdmin->last_name,
                        'name' => trim($primaryAdmin->first_name . ' ' . $primaryAdmin->last_name),
                        'email' => $primaryAdmin->email,
                        'account_id' => $primaryAdmin->account_id,
                    ] : null,
                    'radio_room_admin' => $radioRoomAdmin ? [
                        'id' => $radioRoomAdmin->id,
                        'first_name' => $radioRoomAdmin->first_name,
                        'last_name' => $radioRoomAdmin->last_name,
                        'name' => trim($radioRoomAdmin->first_name . ' ' . $radioRoomAdmin->last_name),
                        'email' => $radioRoomAdmin->email,
                        'account_id' => $radioRoomAdmin->account_id,
                    ] : null,
                    'view_only_admins' => $viewOnlyAdmins,
                    'created_at' => $b->created_at?->format('M d, Y'),
                ];
            });

        return Inertia::render('SuperAdmin/Barangays/Index', [
            'barangays' => $barangays,
        ]);
    }

    public function getPublicBarangayOptions()
    {
        $barangays = Barangay::select('id', 'name', 'city', 'province', 'code')
            ->orderBy('province')
            ->orderBy('city')
            ->orderBy('name')
            ->get();

        return response()->json($barangays);
    }

    public function storeAppeal(Request $request)
    {
        $validated = $request->validate([
            'barangay_id' => ['required', 'exists:barangays,id'],
            'contact_email' => ['required', 'email', 'max:255'],
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        DB::table('barangay_appeals')->insert([
            'id' => (string) Str::uuid(),
            'barangay_id' => $validated['barangay_id'],
            'contact_email' => $validated['contact_email'],
            'reason' => $validated['reason'],
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Reactivation appeal submitted successfully.');
    }

    public function appealsIndex(): Response
    {
        $appeals = DB::table('barangay_appeals')
            ->join('barangays', 'barangay_appeals.barangay_id', '=', 'barangays.id')
            ->select(
                'barangay_appeals.id as appeal_id',
                'barangay_appeals.contact_email',
                'barangay_appeals.reason',
                'barangay_appeals.status',
                'barangay_appeals.created_at',
                'barangays.id as barangay_id',
                'barangays.name as barangay_name',
                'barangays.code as barangay_code',
                'barangays.city',
                'barangays.province',
                'barangays.is_active as barangay_is_active'
            )
            ->latest('barangay_appeals.created_at')
            ->get()
            ->map(function ($a) {
                return [
                    'appeal_id' => $a->appeal_id,
                    'barangay_id' => $a->barangay_id,
                    'barangay_name' => $a->barangay_name,
                    'barangay_code' => $a->barangay_code,
                    'location' => "{$a->city}, {$a->province}",
                    'contact_email' => $a->contact_email,
                    'reason' => $a->reason,
                    'status' => $a->status,
                    'barangay_is_active' => (bool) $a->barangay_is_active,
                    'created_at' => \Carbon\Carbon::parse($a->created_at)->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('SuperAdmin/Barangays/Appeals', [
            'appeals' => $appeals,
        ]);
    }

    public function resolveAppeal(Request $request, string $appealId): RedirectResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'in:approve,reject'],
        ]);

        $appeal = DB::table('barangay_appeals')->where('id', $appealId)->first();
        if (! $appeal) {
            return back()->with('error', 'Appeal record not found.');
        }

        DB::transaction(function () use ($appeal, $validated) {
            if ($validated['action'] === 'approve') {
                DB::table('barangays')
                    ->where('id', $appeal->barangay_id)
                    ->update(['is_active' => true, 'updated_at' => now()]);

                DB::table('barangay_appeals')
                    ->where('id', $appeal->id)
                    ->update(['status' => 'approved', 'updated_at' => now()]);
            } else {
                DB::table('barangay_appeals')
                    ->where('id', $appeal->id)
                    ->update(['status' => 'rejected', 'updated_at' => now()]);
            }
        });

        $msg = $validated['action'] === 'approve' 
            ? 'Appeal approved! Barangay node has been successfully reactivated.' 
            : 'Appeal has been rejected.';

        return back()->with('success', $msg);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barangay_name' => ['required', 'string', 'max:255'],
            'house_street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'contact_email' => ['required', 'email', 'max:255'],
            'admin_first_name' => ['required', 'string', 'max:255'],
            'admin_last_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'radio_room_admin_first_name' => ['required', 'string', 'max:255'],
            'radio_room_admin_last_name' => ['required', 'string', 'max:255'],
            'radio_room_admin_email' => ['required', 'email', 'max:255', 'different:admin_email', 'unique:users,email'],
        ]);

        $rawPassword = '';
        $radioRoomPassword = '';
        $accountId = '';
        $radioRoomAccountId = '';
        $barangayId = '';

        DB::transaction(function () use ($validated, &$rawPassword, &$radioRoomPassword, &$accountId, &$radioRoomAccountId, &$barangayId) {
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
                'contact_phone' => $validated['contact_phone'],
                'contact_email' => $validated['contact_email'],
                'is_active' => true,
            ]);
            $barangayId = $barangay->id;

            $accountId = LocalIdentifier::next($barangay, LocalIdentifier::ADM);

            array_map('trim', $validated);
            $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['admin_last_name']);
            $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Admin'));
            
            $rawPassword = $code . '!' . $readableLastName;

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $accountId,
                'role' => UserRole::Admin,
                'admin_type' => AdminType::General,
                'is_view_only' => false,
                'first_name' => $validated['admin_first_name'],
                'last_name' => $validated['admin_last_name'],
                'email' => $validated['admin_email'],
                'password' => Hash::make($rawPassword),
                'is_active' => true,
                'must_change_password' => true,
            ]);

            $radioRoomAccountId = LocalIdentifier::next($barangay, LocalIdentifier::ADM);
            $radioLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['radio_room_admin_last_name']);
            $radioRoomPassword = $code . '!' . ucfirst(strtolower($radioLastName ?: 'Radio'));

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $radioRoomAccountId,
                'role' => UserRole::Admin,
                'admin_type' => AdminType::RadioRoom,
                'is_view_only' => false,
                'first_name' => $validated['radio_room_admin_first_name'],
                'last_name' => $validated['radio_room_admin_last_name'],
                'email' => $validated['radio_room_admin_email'],
                'password' => Hash::make($radioRoomPassword),
                'is_active' => true,
                'must_change_password' => true,
            ]);
        });

        $barangayDetails = $this->barangayMailDetails(Barangay::findOrFail($barangayId));

        $adminPayload = [
            'account_id' => $accountId,
            'name' => trim($validated['admin_first_name'] . ' ' . $validated['admin_last_name']),
            'email' => $validated['admin_email'],
            'password' => $rawPassword,
            'admin_type_label' => AdminType::General->label(),
            'barangay' => $barangayDetails,
            'title' => 'Primary Administrator Created & Emailed!',
        ];
        $radioRoomAdminPayload = [
            'account_id' => $radioRoomAccountId,
            'name' => trim($validated['radio_room_admin_first_name'] . ' ' . $validated['radio_room_admin_last_name']),
            'email' => $validated['radio_room_admin_email'],
            'password' => $radioRoomPassword,
            'admin_type_label' => AdminType::RadioRoom->label(),
            'barangay' => $barangayDetails,
            'title' => 'Radio Room Administrator Created & Emailed!',
        ];
        $mailFailed = ! $this->sendCredentialEmail($validated['admin_email'], new PrimaryAdminCredentials($adminPayload), 'Primary administrator');
        $mailFailed = ! $this->sendCredentialEmail($validated['radio_room_admin_email'], new PrimaryAdminCredentials($radioRoomAdminPayload), 'Radio Room administrator') || $mailFailed;

        return back()->with([
            $mailFailed ? 'error' : 'success' => $mailFailed
                ? 'Barangay and admin accounts were created, but at least one credential email could not be sent. Check mail settings and the application log.'
                : 'Barangay node and both main admin accounts were provisioned and emailed.',
            'new_admin_credentials' => [$adminPayload, $radioRoomAdminPayload],
            'new_view_only_credentials' => $adminPayload,
        ]);
    }

    public function storeRadioRoomAdmin(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'barangay_id' => ['required', 'exists:barangays,id'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
        ]);

        $accountId = '';
        $rawPassword = '';
        DB::transaction(function () use ($validated, &$accountId, &$rawPassword) {
            $barangay = Barangay::query()->lockForUpdate()->findOrFail($validated['barangay_id']);
            $generalAdminExists = User::query()
                ->where('barangay_id', $barangay->id)
                ->where('role', UserRole::Admin)
                ->where('admin_type', AdminType::General->value)
                ->where('is_view_only', false)
                ->exists();

            if (! $generalAdminExists) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'barangay_id' => 'Provision the General Main Admin before adding a Radio Room Admin.',
                ]);
            }

            $alreadyProvisioned = User::query()
                ->where('barangay_id', $barangay->id)
                ->where('role', UserRole::Admin)
                ->where('admin_type', AdminType::RadioRoom->value)
                ->exists();

            if ($alreadyProvisioned) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'barangay_id' => 'This barangay already has a Radio Room Admin.',
                ]);
            }

            $accountId = LocalIdentifier::next($barangay, LocalIdentifier::ADM);
            $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['last_name']);
            $rawPassword = $barangay->code . '!' . ucfirst(strtolower($cleanLastName ?: 'Radio'));

            User::create([
                'barangay_id' => $barangay->id,
                'account_id' => $accountId,
                'role' => UserRole::Admin,
                'admin_type' => AdminType::RadioRoom,
                'is_view_only' => false,
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]);
        });

        $payload = [
            'account_id' => $accountId,
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'password' => $rawPassword,
            'admin_type_label' => AdminType::RadioRoom->label(),
            'barangay' => $this->barangayMailDetails(Barangay::findOrFail($validated['barangay_id'])),
            'title' => 'Radio Room Administrator Created & Emailed!',
        ];

        $mailFailed = ! $this->sendCredentialEmail($validated['email'], new PrimaryAdminCredentials($payload), 'Radio Room administrator');

        return back()->with([
            $mailFailed ? 'error' : 'success' => $mailFailed
                ? 'Radio Room Admin account created, but its credential email could not be sent. Check mail settings and the application log.'
                : 'Full-access Radio Room Admin account created and emailed.',
            'new_admin_credentials' => [$payload],
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
                'must_change_password' => true,
            ]);
        });

        $viewOnlyPayload = [
            'account_id' => $accountId,
            'name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'password' => $rawPassword,
            'barangay' => $this->barangayMailDetails(Barangay::findOrFail($validated['barangay_id'])),
            'title' => 'View-Only Account Created & Emailed!',
        ];

        $mailFailed = ! $this->sendCredentialEmail($validated['email'], new ViewOnlyAdminCredentials($viewOnlyPayload), 'View-only administrator');

        return back()->with([
            $mailFailed ? 'error' : 'success' => $mailFailed
                ? 'View-only account created, but its credential email could not be sent. Check mail settings and the application log.'
                : 'View-only monitoring account successfully created and emailed.',
            'new_view_only_credentials' => $viewOnlyPayload
        ]);
    }

    private function barangayMailDetails(Barangay $barangay): array
    {
        return [
            'name' => $barangay->name,
            'code' => $barangay->code,
            'house_street' => $barangay->house_street,
            'city' => $barangay->city,
            'province' => $barangay->province,
            'contact_phone' => $barangay->contact_phone,
            'contact_email' => $barangay->contact_email,
        ];
    }

    private function sendCredentialEmail(string $email, Mailable $message, string $accountType): bool
    {
        if (config('mail.default') === 'log') {
            Log::warning('Credential email was not delivered because the log mailer is configured.', [
                'email' => $email,
                'account_type' => $accountType,
            ]);

            return false;
        }

        try {
            Mail::to($email)->send($message);

            return true;
        } catch (\Throwable $exception) {
            Log::error('Administrator credential email failed.', [
                'email' => $email,
                'account_type' => $accountType,
                'exception' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $barangay = Barangay::findOrFail($id);
        $primaryAdmin = User::where('barangay_id', $barangay->id)
            ->where('role', UserRole::Admin)
            ->where('admin_type', AdminType::General->value)
            ->where('is_view_only', false)
            ->first();
        $primaryAdminId = $primaryAdmin?->id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', 'unique:barangays,code,' . $barangay->id],
            'house_street' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'contact_phone' => ['required', 'string', 'max:50'],
            'contact_email' => ['required', 'email', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'primary_admin_first_name' => ['nullable', 'string', 'max:255'],
            'primary_admin_last_name' => ['nullable', 'string', 'max:255'],
            'primary_admin_email' => [
                'nullable',
                'email',
                'max:255',
                $primaryAdminId ? 'unique:users,email,' . $primaryAdminId : 'unique:users,email',
            ],
        ]);

        DB::transaction(function () use ($barangay, $validated) {
            $barangay->update([
                'name' => $validated['name'],
                'code' => $validated['code'],
                'house_street' => $validated['house_street'],
                'city' => $validated['city'],
                'province' => $validated['province'],
                'contact_phone' => $validated['contact_phone'] ?? null,
                'contact_email' => $validated['contact_email'] ?? null,
                'is_active' => $validated['is_active'],
            ]);

            if (!empty($validated['primary_admin_email'])) {
                User::where('barangay_id', $barangay->id)
                    ->where('role', UserRole::Admin)
                    ->where('admin_type', AdminType::General->value)
                    ->where('is_view_only', false)
                    ->update([
                        'first_name' => $validated['primary_admin_first_name'],
                        'last_name' => $validated['primary_admin_last_name'],
                        'email' => $validated['primary_admin_email'],
                        'updated_at' => now(),
                    ]);
            }
        });

        return back()->with('success', 'Barangay node and administrative details updated successfully.');
    }
}