<?php

namespace App\Services\Documents;

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
        $name = trim(implode(' ', array_filter([
            $resident->first_name,
            $resident->middle_name,
            $resident->last_name,
            $resident->name_extension,
        ])));

        $replacements = [
            'resident_name' => $name !== '' ? $name : 'the requesting resident',
            'address' => $address !== '' ? $address : 'the address on record',
            'barangay_name' => $resident->barangay?->name ?: 'this barangay',
            'date' => ($issuedOn ?? now())->timezone(config('app.timezone'))->format('F j, Y'),
            'signatory_name' => trim((string) $template->signatory_name) !== '' ? $template->signatory_name : '________________',
            'signatory_title' => trim((string) $template->signatory_title) !== '' ? $template->signatory_title : 'Punong Barangay',
        ];

        foreach (array_keys(DocumentCatalog::fields()) as $field) {
            $value = trim((string) ($answers[$field] ?? ''));
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
}
