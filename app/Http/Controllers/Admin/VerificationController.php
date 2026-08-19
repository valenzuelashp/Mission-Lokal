<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PreloadedResident;
use App\Models\ResidentRegistration;
use App\Models\ResidentProfile;
use App\Enums\VerificationStatus;
use App\Mail\VerificationApproved;
use App\Mail\VerificationRejected;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class VerificationController extends Controller
{
    // 1. Show the list of everyone waiting in line from resident_registrations
    public function index(Request $request)
    {
        // Show all pending registrations across the system
        $registrations = ResidentRegistration::orderBy('created_at', 'asc')->get();

        $queue = $registrations->map(function ($reg) {
            return [
                'id' => $reg->id,
                'account_id' => 'PENDING-' . $reg->id,
                'first_name' => $reg->first_name,
                'last_name' => $reg->last_name,
                'verification_status' => 'pending', 
                'created_at' => $reg->created_at ? $reg->created_at->toISOString() : null,
            ];
        });

        return Inertia::render('Admin/Verifications/Index', [
            'queue' => $queue
        ]);
    }

    // 2. Open a specific registration to review their ID and thorough comparison (Sets status to in_progress)
    public function show(Request $request, string $id)
    {
        $registration = ResidentRegistration::findOrFail($id);

        // Update corresponding User status to 'in_progress'
        $userAccount = User::where('email', $registration->email)->first();
        if ($userAccount) {
            $userAccount->update(['verification_status' => 'in_progress']);
        }

        // Safely parse birthday for flexible matching
        $parsedBirthday = Carbon::parse($registration->birthday)->format('Y-m-d');

        // Robust Census Lookup: First check via linked account_id, then fallback to name/birthday match
        $censusData = null;
        if ($userAccount && $userAccount->account_id && str_starts_with($userAccount->account_id, 'RES')) {
            $censusData = PreloadedResident::where('account_id', $userAccount->account_id)->first();
        }

        if (!$censusData) {
            $censusData = PreloadedResident::where('first_name', 'like', trim($registration->first_name))
                ->where('last_name', 'like', trim($registration->last_name))
                ->whereDate('birthday', $parsedBirthday)
                ->first();
        }

        // Resident self-registration payload
        $residentData = [
            'id' => $registration->id,
            'account_id' => $censusData ? $censusData->account_id : ($userAccount->account_id ?? 'UNASSIGNED'),
            'first_name' => $registration->first_name,
            'middle_name' => $registration->middle_name ?? '',
            'last_name' => $registration->last_name,
            'name_extension' => $registration->name_extension ?? '',
            'birthday' => $parsedBirthday,
            'sex' => $registration->sex,
            'civil_status' => $registration->civil_status,
            'house_street' => $registration->house_street,
            'barangay_name' => $registration->barangay_name,
            'city' => $registration->city,
            'province' => $registration->province,
            'email' => $registration->email,
            'mobile' => $registration->mobile,
            'resident_profile' => [
                'government_id_storage_key' => $registration->government_id_path,
            ]
        ];

        // Thorough preloaded census payload
        $censusFormatted = $censusData ? [
            'id' => $censusData->id,
            'account_id' => $censusData->account_id,
            'first_name' => $censusData->first_name,
            'middle_name' => $censusData->middle_name ?? '',
            'last_name' => $censusData->last_name,
            'name_extension' => $censusData->name_extension ?? '',
            'birthday' => Carbon::parse($censusData->birthday)->format('Y-m-d'),
            'sex' => $censusData->sex ?? 'Male',
            'civil_status' => $censusData->civil_status ?? 'Single',
            'house_street' => $censusData->house_street ?? $censusData->address ?? '',
            'barangay_name' => $censusData->barangay_name ?? $registration->barangay_name,
            'city' => $censusData->city ?? $registration->city,
            'province' => $censusData->province ?? $registration->province,
            'mobile' => $censusData->mobile ?? '',
        ] : null;

        return Inertia::render('Admin/Verifications/Show', [
            'resident' => $residentData,
            'censusData' => $censusFormatted
        ]);
    }

    // 3. Approve the Resident with optional census record overwrite
    public function approve(Request $request, string $id)
    {
        $request->validate([
            'census_id' => 'nullable|exists:preloaded_residents,id',
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:20',
            'birthday' => 'required|date',
            'sex' => 'required|string',
            'civil_status' => 'required|string',
            'house_street' => 'required|string',
            'barangay_name' => 'required|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'mobile' => 'nullable|string',
        ]);

        $barangayId = $request->user()->barangay_id;
        $registration = ResidentRegistration::findOrFail($id);

        DB::beginTransaction();
        try {
            $preloadedMatch = null;
            if ($request->census_id) {
                $preloadedMatch = PreloadedResident::findOrFail($request->census_id);
                $preloadedMatch->update([
                    'first_name' => $request->first_name,
                    'middle_name' => $request->middle_name,
                    'last_name' => $request->last_name,
                    'name_extension' => $request->name_extension,
                    'birthday' => Carbon::parse($request->birthday)->format('Y-m-d'),
                    'sex' => $request->sex,
                    'civil_status' => $request->civil_status,
                    'house_street' => $request->house_street,
                    'barangay_name' => $request->barangay_name,
                    'city' => $request->city,
                    'province' => $request->province,
                    'mobile' => $request->mobile,
                    'is_claimed' => true,
                    'claimed_at' => now(),
                ]);
            } else {
                $preloadedMatch = PreloadedResident::where('first_name', 'like', $request->first_name)
                    ->where('last_name', 'like', $request->last_name)
                    ->whereDate('birthday', Carbon::parse($request->birthday)->format('Y-m-d'))
                    ->first();

                if ($preloadedMatch) {
                    $preloadedMatch->update([
                        'sex' => $request->sex,
                        'civil_status' => $request->civil_status,
                        'house_street' => $request->house_street,
                        'barangay_name' => $request->barangay_name,
                        'city' => $request->city,
                        'province' => $request->province,
                        'mobile' => $request->mobile,
                        'is_claimed' => true,
                        'claimed_at' => now(),
                    ]);
                }
            }

            $accountId = $preloadedMatch ? $preloadedMatch->account_id : 'RES' . rand(1000, 9999);

            // Custom temporary password format: RES1002!lastname
            $cleanLastName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $request->last_name));
            $rawPassword = $accountId . '!' . $cleanLastName;

            // Update or create User Account with 'approved' status & is_active = false for first login trigger
            $user = User::updateOrCreate(
                ['email' => $registration->email],
                [
                    'barangay_id' => $barangayId ?? $registration->barangay_id,
                    'account_id' => $accountId,
                    'role' => 'resident',
                    'first_name' => $request->first_name,
                    'middle_name' => $request->middle_name,
                    'last_name' => $request->last_name,
                    'name_extension' => $request->name_extension,
                    'mobile' => $request->mobile,
                    'password' => Hash::make($rawPassword),
                    'verification_status' => 'approved',
                    'is_active' => false, // <-- Triggers first login prompt/flow!
                ]
            );

            // Create Resident Profile
            ResidentProfile::create([
                'user_id' => $user->id,
                'birthday' => Carbon::parse($request->birthday)->format('Y-m-d'),
                'sex' => $request->sex,
                'civil_status' => $request->civil_status,
                'house_street' => $request->house_street,
                'barangay_name' => $request->barangay_name,
                'city' => $request->city,
                'province' => $request->province,
                'government_id_storage_key' => $registration->government_id_path,
                'digital_id_code' => 'ML-ID-' . strtoupper(substr(md5($user->id), 0, 8)),
            ]);

            if ($preloadedMatch) {
                $preloadedMatch->update(['user_id' => $user->id]);
            }

            // Delete temporary registration record
            $registration->delete();

            DB::commit();

            if ($user->email) {
                Mail::to($user->email)->send(new VerificationApproved($user, $rawPassword));
            }

            return redirect()->route('admin.verifications.index')
                ->with('success', "Resident officially verified and account created! Temp Password: {$rawPassword}");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => 'Approval transaction failed: ' . $e->getMessage()]);
        }
    }

    // 4. Reject the Resident (Sets status to rejected)
    public function reject(Request $request, string $id)
    {
        $registration = ResidentRegistration::findOrFail($id);

        $request->validate([
            'rejection_reason' => 'required|string|max:255'
        ]);

        $email = $registration->email;
        $firstName = $registration->first_name;

        // Update user status to rejected
        $userAccount = User::where('email', $email)->first();
        if ($userAccount) {
            $userAccount->update(['verification_status' => 'rejected']);
        }

        $registration->delete();

        if ($email) {
            $dummyUser = new User(['email' => $email, 'first_name' => $firstName]);
            Mail::to($email)->send(new VerificationRejected($dummyUser, $request->rejection_reason));
        }

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Registration rejected and applicant notified for re-upload.');
    }

    // --- PHASE 9 SECURITY: DECRYPT ID ON-THE-FLY FOR VIEWING ---
    public function viewId(Request $request, string $path)
    {
        $userRole = Auth::user()->role;
        $roleValue = $userRole instanceof \UnitEnum ? $userRole->value : $userRole;

        if (!Auth::check() || $roleValue !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        if (!Storage::disk('public')->exists($path) && !Storage::disk('local')->exists($path)) {
            abort(404, "File missing from server."); 
        }

        $disk = Storage::disk('public')->exists($path) ? 'public' : 'local';
        $fileContent = Storage::disk($disk)->get($path);

        // If the file has our .enc extension, decrypt it back to normal bytes
        if (Str::endsWith($path, '.enc')) {
            $fileContent = Crypt::decrypt($fileContent);
        }

        // Dynamically detect the Mime Type (e.g., image/jpeg or image/png) from the raw bytes
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $type = $finfo->buffer($fileContent);

        return response($fileContent, 200)->header("Content-Type", $type);
    }
}