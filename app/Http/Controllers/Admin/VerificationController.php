<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\ResidentRegistration;
use App\Models\ResidentProfile;
use App\Enums\VerificationStatus;
use App\Mail\VerificationApproved;
use App\Mail\VerificationRejected;
use App\Models\Notification;
use App\Services\LocalIdentifier;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use Carbon\Carbon;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        $barangayId = $request->user()->barangay_id;

        $registrations = ResidentRegistration::query()
            ->when($barangayId, fn ($query) => $query->where('barangay_id', $barangayId))
            ->orderBy('created_at', 'asc')
            ->get();

        $emails = $registrations->pluck('email')->filter()->all();
        $profilesByEmail = User::query()
            ->whereIn('email', $emails)
            ->with('residentProfile')
            ->get()
            ->keyBy(fn (User $user) => strtolower((string) $user->email));

        $queue = $registrations->map(function ($reg) use ($profilesByEmail) {
            $user = $profilesByEmail->get(strtolower((string) $reg->email));
            $status = $user?->residentProfile?->verification_status;
            $statusValue = $status instanceof VerificationStatus ? $status->value : ($status ?? 'pending');

            return [
                'id' => $reg->id,
                'account_id' => $user?->account_id ?? 'PENDING',
                'first_name' => $reg->first_name,
                'last_name' => $reg->last_name,
                'email' => $reg->email,
                'mobile' => $reg->mobile,
                'verification_status' => $statusValue,
                'created_at' => $reg->created_at ? $reg->created_at->toISOString() : null,
            ];
        });

        return Inertia::render('Admin/Verifications/Index', [
            'queue' => $queue,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $registration = $this->registrationForAdmin($request, $id);
        $userAccount = User::where('email', $registration->email)->first();

        if ($userAccount?->residentProfile) {
            $current = $userAccount->residentProfile->verification_status;
            $currentValue = $current instanceof VerificationStatus ? $current->value : $current;
            if ($currentValue === VerificationStatus::Pending->value || $currentValue === 'pending') {
                $userAccount->residentProfile()->update([
                    'verification_status' => VerificationStatus::InProgress,
                ]);
            }
        }

        $parsedBirthday = Carbon::parse($registration->birthday)->format('Y-m-d');

        $residentData = [
            'id' => $registration->id,
            'account_id' => $userAccount->account_id ?? 'PENDING',
            'first_name' => $registration->first_name,
            'middle_name' => $registration->middle_name ?? '',
            'last_name' => $registration->last_name,
            'name_extension' => $registration->name_extension ?? '',
            'birthday' => $parsedBirthday,
            'house_street' => $registration->house_street,
            'barangay_name' => $registration->barangay_name,
            'city' => $registration->city,
            'province' => $registration->province,
            'email' => $registration->email,
            'mobile' => $registration->mobile,
            'parent_name' => $registration->parent_name,
            'parent_contact' => $registration->parent_contact,
            'resident_profile' => [
                'government_id_storage_key' => $registration->government_id_path,
            ],
        ];

        return Inertia::render('Admin/Verifications/Show', [
            'resident' => $residentData,
            'censusData' => null,
        ]);
    }

    public function approve(Request $request, string $id)
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $validated = $this->validatedResidentFields($request);
        $barangayId = $request->user()->barangay_id;
        $registration = $this->registrationForAdmin($request, $id);
        $verificationEmail = $registration->email;

        DB::beginTransaction();
        try {
            $userAccount = User::where('email', $registration->email)->first();
            $accountId = $userAccount?->account_id ?? LocalIdentifier::next($request->user()->barangay, LocalIdentifier::RES);
            
            $cleanLastName = preg_replace('/[^a-zA-Z0-9]/', '', (string) $validated['last_name']);
            $readableLastName = ucfirst(strtolower($cleanLastName ?: 'Resident'));
            $rawPassword = $accountId.'!'.$readableLastName;

            $parentUserId = null;
            if (! empty($registration->parent_contact)) {
                $parentMatch = User::where('barangay_id', $barangayId ?? $registration->barangay_id)
                    ->where(function ($q) use ($registration) {
                        $q->where('mobile', $registration->parent_contact)
                            ->orWhere('email', $registration->parent_contact);
                    })->first();

                if ($parentMatch) {
                    $parentUserId = $parentMatch->id;
                }
            }

            $user = User::updateOrCreate(
                ['email' => $registration->email],
                [
                    'barangay_id' => $barangayId ?? $registration->barangay_id,
                    'account_id' => $accountId,
                    'role' => 'resident',
                    'first_name' => $validated['first_name'],
                    'middle_name' => $validated['middle_name'],
                    'last_name' => $validated['last_name'],
                    'name_extension' => $validated['name_extension'],
                    'mobile' => $validated['mobile'],
                    'password' => $rawPassword,
                    'is_active' => true,
                    'password_prompt_snoozed_on' => null,
                    'parent_name' => $registration->parent_name,
                    'parent_contact' => $registration->parent_contact,
                    'parent_user_id' => $parentUserId,
                ]
            );

            ResidentProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'verification_status' => VerificationStatus::Approved,
                    'rejection_reason' => null,
                    'birthday' => Carbon::parse($validated['birthday'])->format('Y-m-d'),
                    'house_street' => $validated['house_street'],
                    'barangay_name' => $validated['barangay_name'],
                    'city' => $validated['city'],
                    'province' => $validated['province'],
                    'government_id_storage_key' => $registration->government_id_path,
                    'digital_id_code' => $accountId,
                ]
            );

            $registration->delete();

            DB::table('audit_logs')->insert([
                'barangay_id' => $barangayId ?? $user->barangay_id,
                'actor_id' => Auth::id(),
                'action' => 'APPROVE',
                'entity_type' => 'ResidentRegistration',
                'entity_id' => $user->id,
                'metadata' => json_encode([
                    'details' => 'Approved resident account registration for: '.$validated['first_name'].' '.$validated['last_name'],
                ]),
                'ip_address' => $request->ip(),
                'created_at' => now(),
            ]);

            DB::commit();

            if ($verificationEmail) {
                Mail::to($verificationEmail)->send(new VerificationApproved($user, $rawPassword));
            }

            Notification::create([
                'user_id' => $user->id,
                'channel' => 'in_app',
                'event_type' => 'verification_approved',
                'title' => 'Your account was approved',
                'body' => 'Your registration was verified. Log in with the credentials sent to your email, then change your temporary password.',
                'payload' => ['account_id' => $user->account_id],
                'is_read' => false,
                'sent_at' => now(),
            ]);

            return redirect()->route('admin.verifications.index')
                ->with('success', "Resident verified. Login credentials were emailed to {$verificationEmail}.");
        } catch (\Exception $e) {
            DB::rollBack();

            return redirect()->back()->withErrors(['error' => 'Approval transaction failed: '.$e->getMessage()]);
        }
    }

    public function reject(Request $request, string $id)
    {
        if (! $request->user()->canModifySystem()) {
            return back()->with('error', 'Your account has view-only access and cannot modify system records.');
        }

        $registration = $this->registrationForAdmin($request, $id);

        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $email = $registration->email;
        $firstName = $registration->first_name;
        $lastName = $registration->last_name;

        $userAccount = $this->userAccountForRegistration($registration);
        if ($userAccount) {
            $userAccount->residentProfile()->updateOrCreate(
                ['user_id' => $userAccount->id],
                [
                    'verification_status' => VerificationStatus::Rejected,
                    'rejection_reason' => $request->rejection_reason,
                ]
            );
        }

        $registration->delete();

        DB::table('audit_logs')->insert([
            'barangay_id' => $request->user()->barangay_id,
            'actor_id' => Auth::id(),
            'action' => 'REJECT',
            'entity_type' => 'ResidentRegistration',
            'entity_id' => $id,
            'metadata' => json_encode([
                'details' => 'Rejected resident registration for: '.$firstName.' '.$lastName.' due to: '.$request->rejection_reason,
            ]),
            'ip_address' => $request->ip(),
            'created_at' => now(),
        ]);

        if ($email) {
            $recipient = $userAccount ?? new User(['email' => $email, 'first_name' => $firstName]);
            Mail::to($email)->send(new VerificationRejected($recipient, $request->rejection_reason));
        }

        return redirect()->route('admin.verifications.index')
            ->with('success', 'Registration rejected and applicant notified.');
    }

    public function viewId(Request $request, string $path)
    {
        $userRole = Auth::user()->role;
        $roleValue = $userRole instanceof \UnitEnum ? $userRole->value : $userRole;

        if (! Auth::check() || $roleValue !== 'admin') {
            abort(403, 'Unauthorized access.');
        }

        $path = ltrim(urldecode($path), '/');
        if ($path === '' || str_contains($path, '..')) {
            abort(404, 'File missing from server.');
        }

        if (! Storage::disk('public')->exists($path) && ! Storage::disk('local')->exists($path)) {
            abort(404, 'File missing from server.');
        }

        $disk = Storage::disk('public')->exists($path) ? 'public' : 'local';
        $fileContent = Storage::disk($disk)->get($path);

        if (Str::endsWith($path, '.enc')) {
            $fileContent = Crypt::decrypt($fileContent);
        }

        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $type = $finfo->buffer($fileContent);

        return response($fileContent, 200)->header('Content-Type', $type);
    }

    private function registrationForAdmin(Request $request, string $id): ResidentRegistration
    {
        $query = ResidentRegistration::query()->whereKey($id);
        if ($request->user()->barangay_id) {
            $query->where('barangay_id', $request->user()->barangay_id);
        }

        return $query->firstOrFail();
    }

    private function validatedResidentFields(Request $request): array
    {
        return $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'name_extension' => 'nullable|string|max:20',
            'birthday' => 'required|date',
            'house_street' => 'required|string',
            'barangay_name' => 'required|string',
            'city' => 'required|string',
            'province' => 'required|string',
            'mobile' => 'nullable|string',
        ]);
    }

    private function userAccountForRegistration(ResidentRegistration $registration): ?User
    {
        $email = strtolower(trim((string) $registration->email));
        if ($email !== '') {
            $byEmail = User::whereRaw('LOWER(TRIM(email)) = ?', [$email])->first();
            if ($byEmail) {
                return $byEmail;
            }
        }

        $firstName = strtolower(trim((string) $registration->first_name));
        $lastName = strtolower(trim((string) $registration->last_name));

        return User::where('role', 'resident')
            ->whereRaw('LOWER(TRIM(first_name)) = ?', [$firstName])
            ->whereRaw('LOWER(TRIM(last_name)) = ?', [$lastName])
            ->whereHas('residentProfile', function ($profileQuery) use ($registration) {
                $profileQuery->whereDate('birthday', Carbon::parse($registration->birthday)->toDateString());
            })
            ->first();
    }
}