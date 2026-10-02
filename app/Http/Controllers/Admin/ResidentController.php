<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ResidentProfile;
use App\Models\Notification;
use App\Models\ResidentDocument;
use App\Services\LocalIdentifier;
use App\Enums\VerificationStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

class ResidentController extends Controller
{
    public function index(Request $request): Response
    {
        $barangayId = $request->user()->barangay_id;
        $search = $request->input('search');

        $query = User::where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->with('residentProfile')
            ->withCount('concerns');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('account_id', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $residents = $query->latest()->get()->map(function ($user) {
            $profileStatus = $user->residentProfile?->verification_status;
            $status = $profileStatus?->value ?? $profileStatus ?? 'unverified';
            if ($status === 'verified') {
                $status = 'approved';
            }

            $middleName = trim($user->middle_name ?? '');
            $hasMiddle = !empty($middleName) && strtoupper($middleName) !== 'N/A';
            
            $fullName = trim(
                $user->first_name . ' ' . 
                ($hasMiddle ? $middleName . ' ' : '') . 
                $user->last_name . 
                ($user->name_extension ? ' ' . $user->name_extension : '')
            );

            return [
                'id' => $user->id,
                'account_id' => $user->account_id,
                'full_name' => $fullName,
                'email' => $user->email ?? '—',
                'mobile' => $user->mobile ?? '—',
                'address' => $user->residentProfile?->address ?? $user->address ?? 'No address listed',
                'verification_status' => $status,
                'civic_xp' => (int)($user->residentProfile?->civic_xp ?? 0),
                'badge_count' => (int)($user->badge_count ?? 0),
                'reports_count' => (int)($user->concerns_count ?? 0),
                'joined_at' => $user->created_at ? $user->created_at->format('M d, Y') : 'Unknown',
            ];
        });

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

    public function store(Request $request)
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:20',
            'house_street' => 'required|string|max:255',
            'barangay_name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'birthday' => 'required|date',
            'mobile' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255|unique:users,email',
            'government_id' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'parent_name' => 'nullable|string|max:255',
            'parent_contact' => 'nullable|string|max:20',
        ]);

        $barangay = $request->user()->barangay;
        $barangayId = $barangay?->id;
        $accountId = LocalIdentifier::next($barangay, LocalIdentifier::RES);
        $formattedBirthday = Carbon::parse($request->birthday)->format('Y-m-d');
        $isMinor = Carbon::parse($formattedBirthday)->age < 18;

        $email = $request->email ? strtolower(trim($request->email)) : null;

        $idPath = null;
        if ($request->hasFile('government_id')) {
            $file = $request->file('government_id');
            $extension = $file->getClientOriginalExtension();
            $cleanName = time() . '_' . Str::random(10) . '.' . $extension . '.enc';
            $idPath = 'government_ids/' . $cleanName;

            $encryptedContent = Crypt::encrypt(file_get_contents($file->getRealPath()));
            Storage::disk('local')->put($idPath, $encryptedContent);
        }

        $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $request->last_name);
        $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Resident'));
        $rawPassword = $accountId.'!'.$readableLastName;

        $rawMiddle = trim($request->middle_name ?? '');
        $cleanMiddle = (!empty($rawMiddle) && strtoupper($rawMiddle) !== 'N/A') ? mb_strtoupper($rawMiddle, 'UTF-8') : null;

        DB::beginTransaction();
        try {
            $user = User::create([
                'barangay_id' => $barangayId,
                'account_id' => $accountId,
                'role' => 'resident',
                'first_name' => mb_strtoupper(trim($request->first_name), 'UTF-8'),
                'middle_name' => $cleanMiddle,
                'last_name' => mb_strtoupper(trim($request->last_name), 'UTF-8'),
                'name_extension' => $request->name_extension ? mb_strtoupper(trim($request->name_extension), 'UTF-8') : null,
                'email' => $email,
                'mobile' => $request->mobile ?: null,
                'password' => $rawPassword,
                'is_active' => true,
                'parent_name' => $isMinor ? mb_strtoupper(trim($request->parent_name), 'UTF-8') : null,        
                'parent_contact' => $isMinor ? $request->parent_contact : null,   
            ]);

            $user->residentProfile()->create([
                'verification_status' => VerificationStatus::Approved,
                'birthday' => $formattedBirthday,
                'house_street' => mb_strtoupper(trim($request->house_street), 'UTF-8'),
                'barangay_name' => mb_strtoupper(trim($request->barangay_name), 'UTF-8'),
                'city' => mb_strtoupper(trim($request->city), 'UTF-8'),
                'province' => mb_strtoupper(trim($request->province), 'UTF-8'),
                'address' => trim("{$request->house_street}, {$request->barangay_name}, {$request->city}, {$request->province}"),
                'government_id_storage_key' => $idPath,
                'digital_id_code' => $accountId,
            ]);

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'CREATE_IN_PERSON',
                'entity_type' => 'Resident',
                'entity_id' => $user->id,
                'metadata' => json_encode(['details' => 'Admin registered walk-in resident in-person: ' . $request->first_name . ' ' . $request->last_name]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            DB::commit();

            $hasMiddleClean = !empty($cleanMiddle);
            $formattedFullName = trim($user->first_name . ' ' . ($hasMiddleClean ? $cleanMiddle . ' ' : '') . $user->last_name . ($user->name_extension ? ' ' . $user->name_extension : ''));

            return redirect()->back()->with([
                'success' => 'Resident successfully registered and approved!',
                'new_credentials' => [
                    'account_id' => $accountId,
                    'name' => $formattedFullName,
                    'username' => $email ?: 'None (Use Account ID to login)',
                    'has_email' => !empty($email),
                    'password' => $rawPassword,
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to register resident in-person: ' . $e->getMessage()]);
        }
    }

    public function importCsv(Request $request): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $barangayId = $request->user()->barangay_id;
        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        array_shift($data);

        DB::beginTransaction();
        try {
            $importedCount = 0;
            foreach ($data as $row) {
                if (count($row) < 10) continue; 

                $accountId = LocalIdentifier::next($request->user()->barangay, LocalIdentifier::RES);
                
                $firstName = trim($row[0]);
                $rawMiddle = trim($row[1] ?? '');
                $middleName = (!empty($rawMiddle) && strtoupper($rawMiddle) !== 'N/A') ? $rawMiddle : null;
                $lastName = trim($row[2]);
                $nameExt = trim($row[3] ?? '');
                $houseStreet = trim($row[6]);
                $barangayName = trim($row[7]);
                $city = trim($row[8]);
                $province = trim($row[9]);
                $bday = Carbon::parse(trim($row[10]))->format('Y-m-d');
                $mobile = !empty(trim($row[11] ?? '')) ? trim($row[11]) : null;

                $newUser = User::create([
                    'barangay_id' => $barangayId,
                    'account_id' => $accountId,
                    'role' => 'resident',
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $lastName,
                    'name_extension' => $nameExt,
                    'email' => null,
                    'mobile' => $mobile,
                    'password' => $accountId . '!' . ucfirst(strtolower($lastName)),
                    'is_active' => true,
                ]);

                $newUser->residentProfile()->create([
                    'verification_status' => VerificationStatus::Approved,
                    'birthday' => $bday,
                    'house_street' => $houseStreet,
                    'barangay_name' => $barangayName,
                    'city' => $city,
                    'province' => $province,
                    'address' => trim("{$houseStreet}, {$barangayName}, {$city}, {$province}"),
                    'digital_id_code' => $accountId,
                ]);

                $importedCount++;
            }

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId,
                'actor_id' => Auth::id(),
                'action' => 'IMPORT',
                'entity_type' => 'ResidentBatch',
                'entity_id' => 'CSV-IMPORT',
                'metadata' => json_encode(['details' => "Batch imported {$importedCount} resident records via CSV upload."]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'CSV residents batch imported successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['file' => 'Failed to parse CSV file format. Check structure alignment: ' . $e->getMessage()]);
        }
    }

    public function show(Request $request, string $id): Response
    {
        $barangayId = $request->user()->barangay_id;

        $user = User::where('barangay_id', $barangayId)
            ->where('role', 'resident')
            ->with(['residentProfile', 'concerns' => function($q) {
                $q->latest()->limit(5);
            }])
            ->withCount('concerns')
            ->findOrFail($id);

        $coords = \App\Models\Concern::selectRaw('ST_X(location) as lat, ST_Y(location) as lng')
            ->where('reporter_id', $user->id)
            ->first();

        $documents = [];
        if (class_exists(\App\Models\ResidentDocument::class)) {
            $documents = \App\Models\ResidentDocument::where('user_id', $user->id)
                ->latest()
                ->get()
                ->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'name' => $doc->name,
                        'meta' => $doc->created_at ? $doc->created_at->format('M d, Y') : 'Recent',
                        'size' => $doc->file_size ?? '—',
                        'status' => $doc->status ?? 'verified',
                    ];
                })->toArray();
        }

        $profileStatus = $user->residentProfile?->verification_status;
        $profile = $user->residentProfile;

        $birthday = $profile?->birthday ? Carbon::parse($profile->birthday) : null;
        $ageYears = $birthday ? $birthday->age : null;

        $middleName = trim($user->middle_name ?? '');
        $hasMiddle = !empty($middleName) && strtoupper($middleName) !== 'N/A';

        $fullName = trim(
            $user->first_name . ' ' . 
            ($hasMiddle ? $middleName . ' ' : '') . 
            $user->last_name . 
            ($user->name_extension ? ' ' . $user->name_extension : '')
        );

        $profileDetail = [
            'id' => $user->id,
            'account_id' => $user->account_id,
            'full_name' => $fullName,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'middle_name' => $hasMiddle ? $middleName : '',
            'email' => $user->email ?? '—',
            'mobile' => $user->mobile ?? '—',
            'parent_name' => $user->parent_name ?? null,       
            'parent_contact' => $user->parent_contact ?? null, 
            'address' => $profile?->address ?? $user->address ?? 'No physical address listed',
            'zip_code' => $user->zip_code ?? null,
            'verification_status' => $profileStatus?->value ?? $profileStatus ?? 'unverified',
            'national_id_masked' => $user->id_number ? mask_string($user->id_number) : '—',
            'citizenship_status' => $user->citizenship_status ?? 'Filipino',
            'birthday' => $birthday ? $birthday->format('M d, Y') : '—',
            'age_years' => $ageYears,
            'civic_xp' => (int)($profile?->civic_xp ?? 0),
            'badge_count' => (int)($user->badge_count ?? 0),
            'reports_count' => (int)($user->concerns_count ?? 0),
            'map_lat' => $coords->lat ?? 14.5173079,
            'map_lng' => $coords->lng ?? 120.9933811,
            'emergency_contact' => $user->emergency_contact ? json_decode($user->emergency_contact, true) : null,
            'activities' => $user->concerns->map(function ($concern) {
                return [
                    'id' => $concern->id,
                    'title' => $concern->title,
                    'status' => $concern->status->value ?? $concern->status,
                    'created_at' => $concern->created_at ? $concern->created_at->format('M d, Y') : 'Just now',
                ];
            })->toArray(),
            'documents' => $documents,
            'government_id_url' => $profile?->government_id_storage_key
                ? '/admin/view-id/'.collect(explode('/', $profile->government_id_storage_key))->map(fn ($part) => rawurlencode($part))->implode('/')
                : null,
            'government_id_label' => $user->governmentIdFileLabel(),
            'government_id_is_pdf' => (bool) preg_match('/\.pdf(\.enc)?$/i', (string) ($profile?->government_id_storage_key ?? '')),
        ];

        return Inertia::render('Admin/Residents/Show', [
            'resident' => $profileDetail,
        ]);
    }

    public function uploadDocument(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->where('role', 'resident')->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');
        $path = $file->store('resident-documents', 'public');
        $sizeBytes = $file->getSize();
        $sizeFormatted = $sizeBytes > 1048576 
            ? round($sizeBytes / 1048576, 1) . ' MB' 
            : round($sizeBytes / 1024, 1) . ' KB';

        if (class_exists(\App\Models\ResidentDocument::class)) {
            \App\Models\ResidentDocument::create([
                'id' => Str::uuid()->toString(),
                'user_id' => $user->id,
                'name' => $request->name,
                'file_path' => $path,
                'file_size' => $sizeFormatted,
                'status' => 'verified',
            ]);
        }

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'UPLOAD',
            'entity_type' => 'ResidentDocument',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Uploaded document verification file: ' . $request->name . ' for resident ID: ' . $user->account_id]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Document successfully uploaded.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->where('role', 'resident')->findOrFail($id);

        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
            'mobile' => 'nullable|string|max:20',
        ]);

        $rawMiddle = trim($request->middle_name ?? '');
        $cleanMiddle = (!empty($rawMiddle) && strtoupper($rawMiddle) !== 'N/A') ? mb_strtoupper($rawMiddle, 'UTF-8') : null;

        $user->update([
            'first_name' => mb_strtoupper(trim($request->first_name), 'UTF-8'),
            'middle_name' => $cleanMiddle,
            'last_name' => mb_strtoupper(trim($request->last_name), 'UTF-8'),
            'email' => $request->email ? strtolower(trim($request->email)) : null,
            'mobile' => $request->mobile,
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'UPDATE',
            'entity_type' => 'Resident',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Updated core profile properties for resident account: ' . $user->account_id]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Resident information updated successfully.');
    }

    public function flag(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->where('role', 'resident')->findOrFail($id);

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $statusText = $user->is_active ? 'unflagged/reactivated' : 'flagged';

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'FLAG',
            'entity_type' => 'Resident',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => "Toggled operational status to {$statusText} for resident account: " . $user->account_id]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', "Resident account has been successfully {$statusText}.");
    }

    public function message(Request $request, string $id): RedirectResponse
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $barangayId = $request->user()->barangay_id;
        $user = User::where('barangay_id', $barangayId)->where('role', 'resident')->findOrFail($id);

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        Notification::create([
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'channel' => 'in_app',
            'event_type' => 'admin_message',
            'title' => 'Message from Barangay Admin',
            'body' => $request->message,
            'is_read' => false,
            'sent_at' => now(),
        ]);

        DB::table('audit_logs')->insert([
            'barangay_id' => $barangayId,
            'actor_id' => Auth::id(),
            'action' => 'MESSAGE',
            'entity_type' => 'Resident',
            'entity_id' => $user->id,
            'metadata' => json_encode(['details' => 'Sent direct command center communication message to resident ID: ' . $user->account_id]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Message successfully sent to resident.');
    }
}

if (!function_exists('mask_string')) {
    function mask_string($string) {
        return (strlen($string) > 4) ? str_repeat('*', strlen($string) - 4) . substr($string, -4) : $string;
    }
}