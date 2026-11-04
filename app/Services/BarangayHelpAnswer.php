<?php

namespace App\Services;

use App\Models\LibraryItem;
use App\Services\Documents\DocumentCatalog;
use Illuminate\Support\Collection;

class BarangayHelpAnswer
{
    /**
     * @param  array<string, mixed>  $candidate
     */
    public function generatedText(array $candidate): string
    {
        return collect(data_get($candidate, 'content.parts', []))
            ->pluck('text')
            ->filter(fn ($text): bool => is_string($text))
            ->implode('');
    }

    /**
     * @param  Collection<int, LibraryItem>  $items
     */
    public function fromPublishedKnowledge(string $question, Collection $items): ?string
    {
        $normalized = mb_strtolower($question);
        $normalized = preg_replace('/[^a-z0-9]+/u', ' ', $normalized) ?? $normalized;

        foreach ([
            'first_time_jobseeker' => ['jobseeker', 'job seeker', 'first time job'],
            'indigency' => ['indigency', 'indigent'],
            'barangay_id' => ['barangay id', 'brgy id', 'brngy id'],
            'barangay_clearance' => ['clearance'],
            'certification' => ['certification'],
            'working_permit' => ['working permit', 'work permit'],
        ] as $key => $terms) {
            if ($this->matchesAny($normalized, $terms)) {
                $template = collect(DocumentCatalog::defaults())->firstWhere('key', $key);
                if (! $template) {
                    continue;
                }

                $labels = DocumentCatalog::fields();
                $requirements = array_map(
                    fn (string $field): string => match ($field) {
                        'birthplace' => 'Birthplace',
                        'purpose' => 'Purpose',
                        default => $labels[$field] ?? $field,
                    },
                    $template['resident_fields'],
                );

                return implode("\n", [
                    $template['name'].' requires: '.implode(', ', $requirements).'.',
                    '',
                    'To request it:',
                    '1. Open Documents and select "Request this" for the document.',
                    '2. Complete the required fields and submit the form.',
                    '3. Track it under Your Requests. Wait for barangay review; open the request to print when it is ready.',
                ]);
            }
        }

        $hotline = $this->hotlineAnswer($normalized, $items);
        if ($hotline !== null) {
            return $hotline;
        }

        return null;
    }

    /**
     * @param  Collection<int, LibraryItem>  $items
     */
    private function hotlineAnswer(string $question, Collection $items): ?string
    {
        $allHotlines = $this->matchesAny($question, ['hotline', 'hotlines', 'directory', 'all contact', 'phone numbers']);
        $keywords = [
            'barangay landline' => ['landline'],
            'brgy mobile globe' => ['globe'],
            'brgy mobile smart' => ['smart'],
            'brgy health center' => ['health center', 'health clinic'],
            'emergency' => ['911', 'emergency number'],
            'hems ambulance' => ['ambulance', 'hems'],
            'emergency operation center' => ['operation center', 'operations center'],
            'pque fire central hotline 1' => ['fire hotline', 'fire department', 'fire number'],
            'police station tambo solaire' => ['police', 'police station'],
            'pque fire central hotline 2' => ['fire hotline', 'fire department', 'fire number'],
            'maynilad' => ['maynilad'],
            'meralco' => ['meralco'],
        ];

        $matches = $items
            ->filter(fn (LibraryItem $item): bool => in_array($item->type, ['contact', 'emergency'], true))
            ->filter(function (LibraryItem $item) use ($question, $allHotlines, $keywords): bool {
                if ($allHotlines) {
                    return true;
                }

                $title = mb_strtolower($item->title);
                $terms = $keywords[$this->normalizedTitle($title)] ?? [];

                return $this->matchesAny($question, $terms);
            })
            ->map(function (LibraryItem $item): string {
                $metadata = is_array($item->metadata) ? $item->metadata : [];
                $phone = trim((string) ($metadata['phone'] ?? ''));

                return $phone === '' ? '' : $item->title.': '.$phone;
            })
            ->filter()
            ->values();

        if ($matches->isEmpty()) {
            return null;
        }

        return $matches->implode("\n")."\nCall the listed number and briefly state your concern and location.";
    }

    private function normalizedTitle(string $title): string
    {
        return trim(preg_replace('/[^a-z0-9]+/u', ' ', $title) ?? $title);
    }

    /**
     * @param  list<string>  $terms
     */
    private function matchesAny(string $question, array $terms): bool
    {
        foreach ($terms as $term) {
            if (str_contains($question, $term)) {
                return true;
            }
        }

        return false;
    }
}
