<?php

namespace App\Http\Requests;

use App\Models\ResidentRegistration;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class RegisterResidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => strtolower(trim((string) $this->input('email'))),
        ]);

        if ($this->boolean('no_middle_name')) {
            $this->merge(['middle_name' => 'N/A']);
        }
    }

    public function rules(): array
    {
        // Validate the date before calculating age so malformed dates remain field errors.
        $validBirthday = validator(['birthday' => $this->input('birthday')], [
            'birthday' => ['required', 'date_format:Y-m-d'],
        ])->passes();
        $isMinor = $validBirthday && Carbon::parse($this->input('birthday'))->age < 18;

        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'no_middle_name' => ['nullable', 'boolean'],
            'last_name' => ['required', 'string', 'max:255'],
            'name_extension' => ['nullable', 'string', 'max:20'],
            'birthday' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.Carbon::now()->subYears(12)->toDateString()],
            'email' => ['required', 'string', 'email', 'max:255', 'regex:/^[^@\s]+@gmail\.com$/', 'unique:resident_registrations,email', 'unique:users,email'],
            'mobile' => ['required', 'string', 'regex:/^09[0-9]{9}$/'],
            'parent_name' => [Rule::excludeIf(! $isMinor), 'required', 'string', 'max:255'],
            'parent_contact' => [Rule::excludeIf(! $isMinor), 'required', 'string', 'regex:/^09[0-9]{9}$/'],
        ];

        if (! $this->routeIs('register.identity')) {
            $rules += [
                'house_street' => ['required', 'string', 'max:150'],
                'barangay_name' => ['required', 'string', 'max:100', Rule::exists('barangays', 'name')->where('province', $this->input('province'))->where('city', $this->input('city'))->where('is_active', true)],
                'city' => ['required', 'string', 'max:100', Rule::exists('barangays', 'city')->where('province', $this->input('province'))->where('is_active', true)],
                'province' => ['required', 'string', 'max:100', Rule::exists('barangays', 'province')->where('is_active', true)],
                'government_id' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
                'consent' => ['accepted'],
            ];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'birthday.before_or_equal' => 'You must be at least 12 years old to register an account.',
            'email.regex' => 'Please provide a valid @gmail.com address.',
            'mobile.regex' => 'Phone number must start with 09 and be exactly 11 digits long.',
            'parent_name.required' => 'The parent or guardian name is required for minors (under 18 years old).',
            'parent_contact.required' => 'The parent or guardian contact number is required for minors (under 18 years old).',
            'parent_contact.regex' => 'Guardian phone number must start with 09 and be exactly 11 digits long.',
            'province.exists' => 'Please select a supported province.',
            'city.exists' => 'Please select a city in the selected province.',
            'barangay_name.exists' => 'Please select an active barangay in the selected city and province.',
            'consent.accepted' => 'You must accept the Privacy Policy and consent to data processing to register.',
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $birthday = Carbon::parse($this->input('birthday'))->toDateString();
            $firstName = strtolower(trim($this->input('first_name')));
            $lastName = strtolower(trim($this->input('last_name')));

            $approvedUser = User::where('role', 'resident')
                ->whereHas('residentProfile', function ($query) use ($birthday) {
                    $query->where('verification_status', 'approved')->whereDate('birthday', $birthday);
                })
                ->whereRaw('LOWER(TRIM(first_name)) = ?', [$firstName])
                ->whereRaw('LOWER(TRIM(last_name)) = ?', [$lastName])
                ->exists();

            if ($approvedUser) {
                $validator->errors()->add('general', 'An approved account already exists for this name and birthday. Please proceed to login instead.');

                return;
            }

            if (ResidentRegistration::whereRaw('LOWER(TRIM(first_name)) = ?', [$firstName])
                ->whereRaw('LOWER(TRIM(last_name)) = ?', [$lastName])
                ->whereDate('birthday', $birthday)
                ->exists()) {
                $validator->errors()->add('general', 'A registration for this name and birthday is already pending review.');
            }
        }];
    }
}
