<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterResidentRequest;
use App\Services\LocalIdentifier;
use App\Models\ResidentRegistration;
use App\Models\User;
use App\Models\Notification;
use App\Models\Barangay;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Provide hierarchical location options (Provinces -> Cities -> Barangays) from DB.
     */
    public function getLocationOptions(Request $request): JsonResponse
    {
        $type =$request->query('type');
        $province =$request->query('province');
        $city =$request->query('city');

        if ($type === 'provinces') {$provinces = Barangay::where('is_active', true)
                ->whereNotNull('province')
                ->where('province', '!=', '')
                ->distinct()
                ->orderBy('province', 'asc')
                ->pluck('province');

            return response()->json($provinces);
        }

        if ($type === 'cities') {$query = Barangay::where('is_active', true)
                ->whereNotNull('city')
                ->where('city', '!=', '');

            if ($province) {
                $query->where('province',$province);
            }

            $cities =$query->distinct()
                ->orderBy('city', 'asc')
                ->pluck('city');

            return response()->json($cities);
        }

        if ($type === 'barangays') {$query = Barangay::where('is_active', true)
                ->whereNotNull('name')
                ->where('name', '!=', '');

            if ($province) {
                $query->where('province',$province);
            }
            if ($city) {
                $query->where('city',$city);
            }

            $barangays =$query->orderBy('name', 'asc')
                ->get(['id', 'name', 'code']);

            return response()->json($barangays);
        }

        return response()->json([]);
    }

    public function validateIdentity(RegisterResidentRequest $request): RedirectResponse
    {
        // Checking a step must never create an account or save an uploaded ID.
        return back();
    }

    public function store(RegisterResidentRequest $request): RedirectResponse
    {
        $parsedBirthday = Carbon::parse($request->birthday)->format('Y-m-d');
        $isMinor = Carbon::parse($parsedBirthday)->age < 18;

        // Fetch barangay ID based on selected dropdown values
        $inputBrgy = trim($request->barangay_name);
        $inputCity = trim($request->city);
        $inputProvince = trim($request->province);

        $barangay = Barangay::where('is_active', true)
            ->where('name', $inputBrgy)
            ->where('city', $inputCity)
            ->where('province', $inputProvince)
            ->first();

        $barangayId =$barangay?->id;

        $file =$request->file('government_id');
        $extension =$file->getClientOriginalExtension();
        $cleanName = time() . '_' . Str::random(10) . '.' . $extension . '.enc';
        $idPath = 'government_ids/' .$cleanName;

        $encryptedContent = Crypt::encrypt(file_get_contents($file->getRealPath() ?:$file->getPathname()));
        Storage::disk('local')->put($idPath, $encryptedContent);$registration = ResidentRegistration::create([
            'barangay_id' => $barangayId,
            'first_name' => $request->first_name,
            'middle_name' => $request->middle_name,
            'last_name' => $request->last_name,
            'name_extension' => $request->name_extension,
            'birthday' => $parsedBirthday,
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

        $accountId = $barangay ? LocalIdentifier::next($barangay, LocalIdentifier::RES) : 'RES-' . strtoupper(Str::random(6));

        $user = User::create([
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

        $user->residentProfile()->create([
            'verification_status' => 'pending',
            'birthday' => $parsedBirthday,
            'address' => "{$request->house_street}, {$request->barangay_name}, {$request->city}, {$request->province}",
        ]);

        if ($barangayId) {$fullName = trim($request->first_name.' '.$request->last_name);
            Notification::notifyBarangayAdmins(
                $barangayId,
                'resident_registration',
                'New resident registration',
                $fullName.' submitted a registration for physical record verification.',
                ['registration_id' => $registration->id]
            );
        }

        // Return back to the same registration page with the success flash message
        return back()->with('success', 'Registration submitted successfully! Admin will verify your details against physical barangay records.');
    }

}
