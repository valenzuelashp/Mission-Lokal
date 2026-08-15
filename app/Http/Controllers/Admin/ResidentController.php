<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PreloadedResident;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

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
     * Store a manually added preloaded resident and initialize corresponding user account.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:20',
            'sex' => 'required|in:Male,Female,Other',
            'house_street' => 'required|string|max:255',
            'barangay_name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'province' => 'required|string|max:255',
            'birthday' => 'required|date',
            'mobile' => 'nullable|string|max:20',
        ]);

        $barangayId = $request->user()->barangay_id;
        $latest = PreloadedResident::orderBy('id', 'desc')->first();
        $nextNumber = $latest ? ((int) str_replace('RES', '', $latest->account_id) + 1) : 1;
        $accountId = 'RES' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        $formattedBirthday = Carbon::parse($request->birthday)->format('Y-m-d');

        DB::beginTransaction();
        try {
            // 1. Create Preloaded Census Record
            PreloadedResident::create([
                'barangay_id' => $barangayId,
                'account_id' => $accountId,
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'name_extension' => $request->name_extension,
                'sex' => $request->sex,
                'house_street' => $request->house_street,
                'barangay_name' => $request->barangay_name,
                'city' => $request->city,
                'province' => $request->province,
                'birthday' => $formattedBirthday,
                'email' => null,
                'mobile' => $request->mobile ?: null,
                'is_claimed' => false,
            ]);

            // 2. Initialize corresponding User account with 'unverified' status
            User::create([
                'barangay_id' => $barangayId,
                'account_id' => $accountId,
                'role' => 'resident',
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'name_extension' => $request->name_extension,
                'email' => null,
                'mobile' => $request->mobile ?: null,
                'password' => null,
                'verification_status' => 'unverified',
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Resident successfully added to preloaded registry and initialized as unverified.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Failed to add resident: ' . $e->getMessage()]);
        }
    }

    /**
     * Handle batch CSV import for preloaded residents.
     */
    public function importCsv(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $barangayId = $request->user()->barangay_id;
        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));
        array_shift($data); // Skip header row

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                if (count($row) < 10) continue; 

                $latest = PreloadedResident::orderBy('id', 'desc')->first();
                $nextNumber = $latest ? ((int) str_replace('RES', '', $latest->account_id) + 1) : 1;
                $accountId = 'RES' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
                $bday = Carbon::parse(trim($row[9]))->format('Y-m-d');
                $firstName = trim($row[0]);
                $lastName = trim($row[2]);
                $middleName = trim($row[1] ?? '');
                $nameExt = trim($row[3] ?? '');
                $sex = trim($row[4] ?? 'Male');
                $houseStreet = trim($row[5]);
                $barangayName = trim($row[6]);
                $city = trim($row[7]);
                $province = trim($row[8]);
                $mobile = !empty(trim($row[10] ?? '')) ? trim($row[10]) : null;

                PreloadedResident::create([
                    'barangay_id' => $barangayId,
                    'account_id' => $accountId,
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $lastName,
                    'name_extension' => $nameExt,
                    'sex' => $sex,
                    'house_street' => $houseStreet,
                    'barangay_name' => $barangayName,
                    'city' => $city,
                    'province' => $province,
                    'birthday' => $bday,
                    'email' => null,
                    'mobile' => $mobile,
                    'is_claimed' => false,
                ]);

                User::create([
                    'barangay_id' => $barangayId,
                    'account_id' => $accountId,
                    'role' => 'resident',
                    'first_name' => $firstName,
                    'middle_name' => $middleName,
                    'last_name' => $lastName,
                    'name_extension' => $nameExt,
                    'email' => null,
                    'mobile' => $mobile,
                    'password' => null,
                    'verification_status' => 'unverified',
                ]);
            }
            DB::commit();
            return redirect()->back()->with('success', 'CSV residents batch imported successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['file' => 'Failed to parse CSV file format. Check structure alignment.']);
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
            ->findOrFail($id);

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
            'documents' => [],
        ];

        return Inertia::render('Admin/Residents/Show', [
            'resident' => $profileDetail,
        ]);
    }
}

if (!function_exists('mask_string')) {
    function mask_string($string) {
        return (strlen($string) > 4) ? str_repeat('*', strlen($string) - 4) . substr($string, -4) : $string;
    }
}