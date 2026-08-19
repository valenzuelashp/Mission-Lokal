<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\ResidentRegistration;
use App\Models\PreloadedResident;
use App\Models\User;
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
        $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
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
        ]);

        $parsedBirthday = Carbon::parse($request->birthday)->format('Y-m-d');

        // Check if matching preloaded census record exists
        $preloaded = PreloadedResident::where('first_name', 'like', $request->first_name)
            ->where('last_name', 'like', $request->last_name)
            ->whereDate('birthday', $parsedBirthday)
            ->first();

        $barangayId = $preloaded ? $preloaded->barangay_id : \App\Models\Barangay::first()?->id;

        // --- PHASE 9 SECURITY: ENCRYPT ID AT REST ---
        $file = $request->file('government_id');
        $extension = $file->getClientOriginalExtension();
        // Append .enc so we know this file is encrypted
        $cleanName = time() . '_' . \Illuminate\Support\Str::random(10) . '.' . $extension . '.enc';
        $idPath = 'government_ids/' . $cleanName;

        // Extract raw bytes, scramble them using Laravel's encryption key, and save to the private 'local' disk
        $encryptedContent = \Illuminate\Support\Facades\Crypt::encrypt(file_get_contents($file->getRealPath()));
        \Illuminate\Support\Facades\Storage::disk('local')->put($idPath, $encryptedContent);
        // ---------------------------------------------
        // 1. Save into temporary resident_registrations staging table
        ResidentRegistration::create([
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
        ]);

        // 2. Locate existing placeholder user account or create one if none preloaded
        $user = null;
        if ($preloaded) {
            $user = User::where('account_id', $preloaded->account_id)->first();
        }

        if (!$user) {
            // Fallback match by name if preloaded link wasn't explicit
            $user = User::where('first_name', 'like', $request->first_name)
                ->where('last_name', 'like', $request->last_name)
                ->first();
        }

        $accountId = $preloaded ? $preloaded->account_id : ('RES' . rand(1000, 9999));

        if ($user) {
            // Update the existing placeholder record directly so it doesn't duplicate
            $user->update([
                'email' => $request->email,
                'mobile' => $request->mobile,
                'verification_status' => 'pending',
            ]);
        } else {
            // Create new if no preloaded entry existed at all
            User::create([
                'barangay_id' => $barangayId,
                'account_id' => $accountId,
                'role' => 'resident',
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'last_name' => $request->last_name,
                'name_extension' => $request->name_extension,
                'email' => $request->email,
                'mobile' => $request->mobile,
                'verification_status' => 'pending',
            ]);
        }

        return redirect()->route('account.status')->with('success', 'Registration submitted successfully! You can now track your verification status.');
    }
}