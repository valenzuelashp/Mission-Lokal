<?php

namespace App\Services;

use Illuminate\Support\Collection;

class BarangayHelpAnswer
{
    public function generatedText(array $candidate): string
    {
        return collect(data_get($candidate, 'content.parts', []))
            ->filter(fn ($part): bool => is_array($part) && empty($part['thought']) && is_string($part['text'] ?? null))
            ->pluck('text')->implode('');
    }

    public function fromPublishedKnowledge(string $question, Collection $items, ?Collection $templates = null): ?string
    {
        $knowledge = new BarangayHelpKnowledge;
        $sources = $knowledge->sources($items, $templates);

        return $this->direct($question, $knowledge->rank($question, $sources), $sources)['answer'] ?? null;
    }

    public function direct(string $question, array $sources, array $contacts, array $documents = []): ?array
    {
        $knowledge = new BarangayHelpKnowledge;
        $normalized = $knowledge->normalize($question);
        $tokens = $knowledge->tokens($question);
        $filipino = $knowledge->isFilipino($question);
        $emergency = $this->isEmergency($question);

        if ($documents !== [] && $knowledge->facet($question) === null
            && preg_match('/\b(online|available|list|what can i|pwede|puwede)\b/', $normalized)
            && preg_match('/\b(documents?|forms?|request|irequest|apply|kumuha)\b/', $normalized)
            && array_intersect($tokens, ['clearance', 'indigency', 'id', 'jobseeker', 'permit', 'certification']) === []) {
            return $this->reply(
                ($filipino ? 'Available na online document request forms:' : 'Available online document request forms:')."\n"
                .implode("\n", array_map(fn ($source): string => '• '.$source['title'], $documents))."\n\n"
                .($filipino ? 'Buksan ang Documents, piliin ang Request this, at kumpletuhin ang form. I-track sa Your Requests; kailangan pa rin ng barangay review.'
                    : 'Open Documents, select Request this, and complete the form. Track it under Your Requests; requests still require barangay review.'),
                'barangay', $documents,
            );
        }

        if (($knowledge->facet($question) === null && in_array('contact', $tokens, true)) || $emergency) {
            $categories = array_intersect($tokens, ['fire', 'police', 'ambulance', 'health', 'landline', 'globe', 'smart', 'water', 'electric']);
            $matching = array_values(array_filter($contacts, function ($source) use ($knowledge, $categories, $emergency): bool {
                if (! in_array($source['type'], ['contact', 'emergency'], true) || ! ($source['phone'] ?? null)) {
                    return false;
                }
                if ($categories !== []) {
                    return array_intersect($categories, $knowledge->tokens($source['title'].' '.$source['text'])) !== [];
                }

                return ! $emergency || $source['type'] === 'emergency';
            }));
            if ($emergency && $matching === []) {
                $matching = array_values(array_filter($contacts, fn ($source): bool => $source['type'] === 'emergency' && ($source['phone'] ?? null)));
            }
            if ($matching !== []) {
                $lines = array_map(fn ($source): string => $source['title'].': '.$source['phone'], $matching);
                $lines[] = $filipino ? 'Tawagan ang nakalistang numero at sabihin ang inyong lokasyon at sitwasyon.' : 'Call the listed number and briefly state your concern and location.';

                return $this->reply(implode("\n", $lines), 'barangay', $matching);
            }
            if ($emergency) {
                return $this->reply($filipino
                    ? 'Kung may agarang panganib, humingi agad ng tulong sa mga responder o awtoridad na malapit sa inyo. Wala akong makumpirmang emergency contact sa published barangay records. Gamitin ang isang opisyal na emergency contact na alam na ninyong tama; hindi ako magbibigay ng hinulaang numero.'
                    : 'If there is immediate danger, seek help from nearby responders or authorities now. I could not confirm an emergency contact in the published barangay records. Use an official emergency contact you already know to be correct; I will not guess a hotline number.', 'general');
            }
        }

        if ($knowledge->facet($question) === null && preg_match('/\b(requirements|requirement|needed|need|papers|documents|required|kailangan|kelangan|dadalin|dalhin|dokumento|request|apply|kuha|kumuha|kukuha|magrequest|magapply)\b/', $normalized)) {
            $publishedRequirements = array_filter($sources, fn ($source): bool => in_array($source['type'], ['faq', 'manual'], true)
                && preg_match('/\b(requirements?|required|supporting|bring|submit|kailangan|dalhin)\b/i', $source['title'].' '.$source['text']));
            if ($publishedRequirements !== [] || preg_match('/\b(supporting|papers|bring|dalhin|tax|nbi|court|police)\b/', $normalized)) {
                return null;
            }
            $documents = array_values(array_filter($sources, fn ($source): bool => $source['type'] === 'document'));
            // A plain clearance question refers to the resident form; business forms need that qualifier.
            if (! in_array('business', $tokens, true)) {
                $documents = array_values(array_filter($documents, fn ($source): bool => ($source['key'] ?? '') !== 'business_clearance'));
            }
            $query = array_diff($tokens, ['requirements', 'request', 'document', 'documents', 'form', 'fields', 'certificate']);
            $documents = array_values(array_filter($documents, fn ($source): bool => array_intersect($query, $knowledge->tokens($source['title'])) !== []));
            if (count($documents) === 1) {
                return $this->reply($documents[0]['title']."\n".$documents[0]['text'], 'barangay', $documents);
            }
        }

        return null;
    }

    public function isEmergency(string $question): bool
    {
        $normalized = (new BarangayHelpKnowledge)->normalize($question);
        if (preg_match('/\b(prepare|preparedness|prevent|prevention|drill|paghahanda|maghanda|maiwasan)\b/', $normalized)
            && ! preg_match('/\b(now|currently|nasusunog|binabaha|hindi makahinga|walang malay)\b/', $normalized)) {
            return false;
        }

        return (bool) preg_match('/\b(emergency|urgent|ambulance|ambulansya|nasusunog|may sunog|may baha|binabaha|help.*(?:fire|bleeding|breathe)|(?:fire|bleeding|breathe).*(?:now|help)|hindi makahinga|unconscious|walang malay|someone is bleeding|choking|nasaksak|nanaksak|binaril|barilan|nalulunod|hinimatay)\b/', $normalized);
    }

    public function restricted(string $question): ?array
    {
        if (preg_match('/\b(api[ _-]?keys?|system prompt|passwords|confidential|resident (?:records|list)|private (?:records|data)|blotter (?:details|records)|(?:show|reveal|give|tell).{0,50}(?:password|internal notes)|(?:ilabas|ipakita|ibigay).{0,50}(?:password|pribado|blotter))\b/iu', $question)) {
            return $this->reply((new BarangayHelpKnowledge)->isFilipino($question)
                ? 'Hindi ako nagbibigay ng passwords, pribadong resident records, confidential blotter details, o internal system information. Maaari kitang tulungan sa published barangay services at tamang paraan ng paglapit sa barangay.'
                : 'I cannot provide passwords, private resident records, confidential blotter details, or internal system information. I can help with published barangay services and explain how to contact the appropriate office.', 'restricted');
        }

        return null;
    }

    public function generated(array $data, array $sources, string $question): ?array
    {
        if (! in_array($data['kind'] ?? null, ['answer', 'clarification', 'out_of_scope'], true)
            || ! is_string($data['guidance'] ?? null) || ! is_array($data['evidence'] ?? null) || count($data['evidence']) > 3) {
            return null;
        }
        if ($data['kind'] === 'out_of_scope') {
            return $this->reply((new BarangayHelpKnowledge)->isFilipino($question)
                ? 'Maaari kitang tulungan sa barangay services, community concerns, public contacts, at pangkalahatang gabay para sa mga residente. Ano ang kailangan mong malaman tungkol dito?'
                : 'I can help with barangay services, community concerns, public contacts, and general guidance for residents. What would you like to know about those topics?', 'clarification');
        }

        $byId = array_column($sources, null, 'id');
        $quotes = [];
        $cited = [];
        foreach (array_slice($data['evidence'], 0, 3) as $evidence) {
            if (! is_array($evidence) || ! is_string($evidence['source_id'] ?? null)) {
                return null;
            }
            $source = $byId[$evidence['source_id'] ?? ''] ?? null;
            $quote = $evidence['quote'] ?? null;
            // Official facts are exact excerpts, never unsupported model paraphrases.
            if (! $source || ! is_string($quote) || mb_strlen($quote) < 8 || mb_strlen($quote) > 1400 || ! str_contains($source['text'], $quote)) {
                return null;
            }
            $quotes[] = $source['title']."\n".$quote;
            $cited[$source['id']] = $source;
        }
        $guidance = trim($data['guidance']);
        if (mb_strlen($guidance) > 1800 || ! $this->safeGeneralGuidance($guidance)) {
            return null;
        }
        if ($quotes === [] && $guidance === '') {
            return null;
        }
        if ($data['kind'] === 'clarification') {
            return $quotes === [] && $guidance !== '' ? $this->reply($guidance, 'clarification') : null;
        }
        $filipino = (new BarangayHelpKnowledge)->isFilipino($question);
        $answer = implode("\n\n", $quotes);
        if ($guidance !== '') {
            $answer .= ($answer !== '' ? "\n\n" : '').($filipino ? 'Pangkalahatang gabay (hindi kumpirmadong barangay policy):' : 'General guidance (not confirmed barangay policy):')."\n".$guidance;
        }

        return $this->reply($answer, $quotes === [] ? 'general' : ($guidance === '' ? 'barangay' : 'mixed'), array_values($cited));
    }

    private function safeGeneralGuidance(string $guidance): bool
    {
        $withoutListMarkers = preg_replace('/^\s*\d+[.)]\s+/m', '', $guidance);

        // Precise numbers, fees, schedules, links, and contacts belong in quoted public evidence.
        return ! preg_match('/[\p{N}₱$%]|https?:\/\/|www\./u', $withoutListMarkers)
            && ! preg_match('/\b(our barangay|this barangay (?:requires|charges|opens|closes)|official (?:fee|schedule|requirements?) (?:is|are)|must (?:bring|submit|pay)|kailangan mong (?:magbayad|dalhin|magsumite))\b/iu', $guidance);
    }

    public function fallback(string $question, bool $recordsAvailable, array $sources = []): array
    {
        $knowledge = new BarangayHelpKnowledge;
        $filipino = $knowledge->isFilipino($question);
        if ($sources !== []) {
            $selected = array_slice($sources, 0, 2);

            return $this->reply(($filipino ? 'Kaugnay na published barangay records:' : 'Related published barangay records:')."\n\n".implode("\n\n", array_map(fn ($source): string => $source['title']."\n".$source['text'], $selected)), 'barangay', $selected);
        }
        $limitation = $recordsAvailable
            ? ($filipino ? 'Wala akong published barangay information na kumukumpirma nito.' : 'I do not have published barangay information confirming this.')
            : ($filipino ? 'Hindi ko ma-check ang published barangay records sa ngayon.' : 'I cannot check the published barangay records right now.');
        $guidance = match ($knowledge->facet($question)) {
            'hours' => ! $knowledge->isOfficeHours($question)
                ? ($filipino ? 'Maaaring mag-iba ang schedule ayon sa serbisyo. Kumpirmahin ang kasalukuyang schedule sa barangay o sa published service advisory bago magplano.' : 'Schedules vary by service. Confirm the current schedule with the barangay or its published service advisory before making plans.')
                : ($filipino
                ? 'Pangkalahatang gabay: maraming tanggapan ng gobyerno sa Pilipinas ang bukas nang humigit-kumulang 8:00 AM–5:00 PM tuwing weekday. Hindi ito kumpirmadong oras ng inyong barangay. Kumpirmahin muna ang schedule bago pumunta.'
                : 'General guidance: many Philippine government offices operate approximately 8:00 AM–5:00 PM on weekdays. This is not a verified schedule for your barangay. Confirm the actual hours before visiting.'),
            'fee' => $filipino
                ? 'Maaaring mag-iba ang bayad at exemptions ayon sa serbisyo at lokal na patakaran. Kumpirmahin ang kasalukuyang fee sa barangay bago magbayad; humingi ng official receipt.'
                : 'Fees and exemptions can vary by service and local policy. Confirm the current fee with the barangay before paying and ask for an official receipt.',
            'duration' => $filipino
                ? 'Maaaring mag-iba ang processing time ayon sa serbisyo at review. Kung nagsumite ka sa Mission-Lokal, tingnan ang Your Requests sa Documents para sa update; kumpirmahin ang timeline sa barangay.'
                : 'Processing time depends on the service and its review. If you applied through Mission-Lokal, check Your Requests under Documents for updates and confirm the timeline with the barangay.',
            default => $filipino
                ? 'Sabihin kung anong serbisyo, dokumento, o community concern ang kailangan mo. Tingnan din ang Resource Library para sa published contacts at gabay, at kumpirmahin sa barangay ang lokal na requirements.'
                : 'Tell me which service, document, or community concern you need help with. You can also check the Resource Library for published contacts and guidance, and confirm local requirements with the barangay.',
        };

        return $this->reply($limitation."\n\n".$guidance, 'general');
    }

    public function reply(string $answer, string $basis, array $sources = []): array
    {
        return [
            'answer' => $answer, 'basis' => $basis,
            'sources' => array_values(array_map(fn ($source): array => array_intersect_key($source, array_flip(['id', 'title', 'url', 'updated_at'])), $sources)),
            'status' => 'answered', 'notice' => null,
        ];
    }
}
