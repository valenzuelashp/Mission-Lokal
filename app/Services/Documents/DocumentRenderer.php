<?php

namespace App\Services\Documents;

use App\Models\Barangay;
use App\Models\DocumentRequest;
use App\Models\DocumentTemplate;
use App\Models\User;
use Illuminate\Support\Carbon;

class DocumentRenderer
{
    /**
     * @param  array<string, mixed>  $answers
     */
    public function render(DocumentTemplate $template, User $resident, array $answers, ?Carbon $issuedOn = null): string
    {
        $resident->loadMissing(['residentProfile', 'barangay']);
        $profile = $resident->residentProfile;
        $address = trim((string) ($profile?->address ?: $profile?->house_street));
        
        $rawMiddle = trim((string) $resident->middle_name);
        $cleanMiddle = (!empty($rawMiddle) && strtoupper($rawMiddle) !== 'N/A') ? $rawMiddle : null;

        $name = trim(implode(' ', array_filter([
            $resident->first_name,
            $cleanMiddle,
            $resident->last_name,
            $resident->name_extension,
        ])));

        $replacements = [
            'resident_name' => $name !== '' ? mb_strtoupper($name) : 'THE REQUESTING RESIDENT',
            'address' => $address !== '' ? $address : 'the address on record',
            'barangay_name' => $resident->barangay?->name ?: 'this barangay',
            'date' => ($issuedOn ?? now())->timezone(config('app.timezone'))->format('F j, Y'),
            'signatory_name' => trim((string) $template->signatory_name) !== '' ? $template->signatory_name : '________________',
            'signatory_title' => trim((string) $template->signatory_title) !== '' ? $template->signatory_title : 'Barangay Chairman',
        ];

        foreach (array_keys(DocumentCatalog::fields()) as $field) {
            $value = trim((string) ($answers[$field] ?? ''));
            if ($value !== '' && $field === 'business_name') {
                $value = mb_strtoupper($value);
            }
            $replacements[$field] = $value !== '' ? $value : '________';
        }

        $body = $template->body;
        foreach ($replacements as $key => $value) {
            $body = str_replace('{{'.$key.'}}', $value, $body);
        }

        return $body;
    }

    public function renderRequest(DocumentRequest $request): string
    {
        $request->loadMissing(['template', 'resident.residentProfile', 'resident.barangay']);

        return $this->render(
            $request->template,
            $request->resident,
            $request->answers ?? [],
            $request->reviewed_at ?? $request->created_at,
        );
    }

    /**
     * @return array{barangay_name: ?string, city: ?string, contact_phone: ?string, logo_url: ?string}
     */
    public function letterhead(?Barangay $barangay): array
    {
        $code = strtolower((string) ($barangay?->code ?? ''));
        $logoFile = $code !== '' ? public_path('images/barangay-'.$code.'-logo.png') : '';
        $phone = trim((string) ($barangay?->contact_phone ?? ''));

        return [
            'barangay_name' => $barangay?->name,
            'city' => $barangay?->city,
            'contact_phone' => ($phone !== '' && strcasecmp($phone, 'N/A') !== 0) ? $phone : null,
            'logo_url' => ($logoFile !== '' && is_file($logoFile)) ? asset('images/barangay-'.$code.'-logo.png') : null,
        ];
    }

    /**
     * @return array{issued_day: string, issued_month: string, issued_year: string}
     */
    public function issuedParts(?Carbon $issuedOn): array
    {
        $issuedOn = ($issuedOn ?? now())->timezone(config('app.timezone'));
        $day = (int) $issuedOn->format('j');

        return [
            'issued_day' => $day.$this->ordinal($day),
            'issued_month' => $issuedOn->format('F'),
            'issued_year' => $issuedOn->format('Y'),
        ];
    }

    private function ordinal(int $day): string
    {
        if (in_array($day % 100, [11, 12, 13], true)) {
            return 'th';
        }

        return match ($day % 10) {
            1 => 'st',
            2 => 'nd',
            3 => 'rd',
            default => 'th',
        };
    }
}