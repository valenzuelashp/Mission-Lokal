<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ResidentRegistration;
use App\Models\PreloadedResident;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        if ($request->boolean('no_middle_name')) {
            $request->merge(['middle_name' => 'N/A']);
        }

        $request->merge([
            'first_name' => $this->upperCase($request->first_name),
            'middle_name' => $this->upperCase($request->middle_name),
            'last_name' => $this->upperCase($request->last_name),
            'name_extension' => $this->upperCase($request->name_extension),
            'house_street' => $this->upperCase($request->house_street),
            'barangay_name' => $this->upperCase($request->barangay_name),
            'city' => $this->upperCase($request->city),
            'province' => $this->upperCase($request->province),
            'parent_name' => $this->upperCase($request->parent_name),
            'email' => strtolower(trim((string) $request->email)),
        ]);
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'no_middle_name' => 'nullable|boolean',
            'last_name' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:20',
            'house_street' => 'required|string|max:150',
            'barangay_name' => 'required|string|max:100',
            'city' => 'required|string|max:100',
            'province' => 'required|string|max:100',
            'birthday' => 'required|date',
            'email' => 'required|string|email|max:255|unique:users|unique:resident_registrations',
            'mobile' => 'required|string|max:20',
            'sex' => 'required|string|in:Male,Female,Other',
            'civil_status' => 'required|string|in:Single,Married,Widowed,Separated',
            'government_id' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'parent_name' => [
                'nullable',
                'string',
                'max:255',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->birthday && Carbon::parse($request->birthday)->age < 18 && empty($value)) {
                        $fail('The parent or guardian name is required for minors (under 18 years old).');
                    }
                },
            ],
            'parent_contact' => [
                'nullable',
                'string',
                'max:20',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->birthday && Carbon::parse($request->birthday)->age < 18 && empty($value)) {
                        $fail('The parent or guardian contact number is required for minors (under 18 years old).');
                    }
                },
            ],
            'consent' => 'accepted', 
        ], [
            'consent.accepted' => 'You must accept the Privacy Policy and consent to data processing to register.',
        ]);

        $parsedBirthday = Carbon::parse($request->birthday)->format('Y-m-d');
        $isMinor = Carbon::parse($parsedBirthday)->age < 18;
        $firstName = strtolower(trim($request->first_name));
        $lastName = strtolower(trim($request->last_name));

        $approvedUser = User::where('role', 'resident')
            ->whereHas('residentProfile', function ($profileQuery) use ($parsedBirthday) {
                $profileQuery->where('verification_status', 'approved')
                             ->whereDate('birthday', $parsedBirthday);
            })
            ->whereRaw('LOWER(TRIM(first_name)) = ?', [$firstName])
            ->whereRaw('LOWER(TRIM(last_name)) = ?', [$lastName])
            ->first();

        if ($approvedUser) {
            return back()->withErrors([
                'general' => 'An approved account already exists for this name and birthday. Please proceed to login instead.',
            ])->withInput();
        }

        $pendingRegistration = ResidentRegistration::whereRaw('LOWER(TRIM(first_name)) = ?', [$firstName])
            ->whereRaw('LOWER(TRIM(last_name)) = ?', [$lastName])
            ->whereDate('birthday', $parsedBirthday)
            ->exists();

        if ($pendingRegistration) {
            return back()->withErrors([
                'general' => 'A registration for this name and birthday is already pending review.',
            ])->withInput();
        }

        $preloaded = PreloadedResident::findByIdentity(
            $request->first_name,
            $request->last_name,
            $parsedBirthday,
            $request->middle_name
        );

        $existingUser = User::whereRaw('LOWER(TRIM(email)) = ?', [strtolower(trim($request->email))])->first();
        if ($existingUser && $existingUser->residentProfile?->verification_status?->value === 'approved') {
            return back()->withErrors([
                'general' => 'An approved account already exists for this name and email. Please proceed to login instead.',
            ])->withInput();
        }

        $barangayId = $preloaded->barangay_id ?? \App\Models\Barangay::first()?->id;

        $file = $request->file('government_id');
        $extension = $file->getClientOriginalExtension();
        $cleanName = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $extension . '.enc';
        $idPath = 'government_ids/' . $cleanName;

        $encryptedContent = \Illuminate\Support\Facades\Crypt::encrypt(file_get_contents($file->getRealPath()));
        \Illuminate\Support\Facades\Storage::disk('local')->put($idPath, $encryptedContent);
        
        $registration = ResidentRegistration::create([
            'barangay_id' => $barangayId,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'name_extension' => $request->name_extension,
            'birthday' => $parsedBirthday,
            'sex' => $request->sex,
            'civil_status' => $request->civil_status,
            'house_street' => $request->house_street,
            'barangay_name' => $request->barangay_name,
            'city' => $request->city,
            'province' => $request->province,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'government_id_path' => $idPath,
            'parent_name' => $isMinor ? $request->parent_name : null,
            'parent_contact' => $isMinor ? $request->parent_contact : null,
        ]);

        $user = null;
        if ($preloaded) {
            $user = User::where('account_id', $preloaded->account_id)->first();
        }

        if (!$user) {
            $user = User::where('first_name', 'like', $request->first_name)
                ->where('last_name', 'like', $request->last_name)
                ->first();
        }

        $accountId = $preloaded ? $preloaded->account_id : ('RES' . rand(1000, 9999));

        if ($user) {
            $user->update([
                'email' => $request->email,
                'mobile' => $request->mobile,
                'parent_name' => $isMinor ? $request->parent_name : null,
                'parent_contact' => $isMinor ? $request->parent_contact : null,
            ]);
            $user->residentProfile()->updateOrCreate(
                ['user_id' => $user->id],
                ['verification_status' => 'pending']
            );
        } else {
            $newUser = User::create([
                'barangay_id' => $barangayId,
                'account_id' => $accountId,
                'role' => 'resident',
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'name_extension' => $request->name_extension,
                'email' => $request->email,
                'mobile' => $request->mobile,
                'parent_name' => $isMinor ? $request->parent_name : null,
                'parent_contact' => $isMinor ? $request->parent_contact : null,
            ]);
            $newUser->residentProfile()->create([
                'verification_status' => 'pending',
            ]);
        }

        $fullName = trim($request->first_name.' '.$request->last_name);
        Notification::notifyBarangayAdmins(
            $barangayId,
            'resident_registration',
            'New resident registration',
            $fullName.' submitted a registration for review.',
            ['registration_id' => $registration->id]
        );

        return redirect()->route('account.status')->with('success', 'Registration submitted successfully! You can now track your verification status.');
    }

    private function upperCase(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);
        if ($trimmed === '') {
            return '';
        }

        return mb_strtoupper($trimmed, 'UTF-8');
    }
}