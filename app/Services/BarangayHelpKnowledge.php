<?php

namespace App\Services;

use App\Models\DocumentTemplate;
use App\Models\LibraryItem;
use App\Services\Documents\DocumentCatalog;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class BarangayHelpKnowledge
{
    private const ALIASES = [
        'barangay' => ['brgy', 'brngy', 'baranggay'],
        'hours' => ['hour', 'open', 'opens', 'opening', 'close', 'closes', 'closing', 'oras', 'bukas', 'schedule', 'schedules', 'iskedyul'],
        'office' => ['hall', 'opisina', 'tanggapan'],
        'fee' => ['fees', 'cost', 'costs', 'price', 'payment', 'charge', 'charges', 'magkano', 'bayad', 'halaga'],
        'requirements' => ['requirement', 'required', 'needed', 'need', 'papers', 'kailangan', 'kelangan', 'dadalin', 'dalhin', 'dokumento'],
        'request' => ['apply', 'application', 'kuha', 'kumuha', 'kukuha', 'magrequest', 'magapply', 'pagkuha'],
        'clearance' => ['clearnce', 'clerance', 'clearence'],
        'indigency' => ['indigent'],
        'jobseeker' => ['jobseekers'],
        'contact' => ['contacts', 'hotline', 'hotlines', 'telephone', 'phone', 'number', 'numbers', 'tawag', 'numero', 'kontak'],
        'fire' => ['sunog', 'nasusunog', 'bumbero', 'apoy'],
        'police' => ['pulis', 'pulisya'],
        'ambulance' => ['ambulansya', 'ambulansiya', 'hems'],
        'health' => ['medical', 'clinic', 'kalusugan', 'ospital'],
        'flood' => ['flooding', 'baha', 'binabaha', 'inundation'],
        'earthquake' => ['lindol'],
        'evacuation' => ['evacuate', 'evacuating', 'evac', 'likas', 'lilikas', 'paglikas'],
        'waste' => ['garbage', 'trash', 'basura'],
        'complaint' => ['concern', 'concerns', 'reklamo', 'ireklamo', 'report', 'reporting'],
        'water' => ['tubig', 'maynilad'],
        'electric' => ['electricity', 'kuryente', 'meralco'],
        'duration' => ['processing', 'long', 'days', 'tagal', 'katagal', 'gaano'],
    ];

    private const STOP_WORDS = ['a', 'an', 'and', 'ang', 'are', 'at', 'ba', 'barangay', 'be', 'can', 'do', 'does', 'for', 'from', 'get', 'how', 'i', 'in', 'is', 'it', 'ko', 'lang', 'me', 'mga', 'my', 'na', 'ng', 'of', 'on', 'or', 'please', 'po', 'sa', 'the', 'this', 'to', 'what', 'when', 'where', 'which', 'with', 'you', 'your', 'ano', 'anong', 'paano', 'pano', 'saan', 'kailan', 'yung', 'naman', 'would', 'could', 'time'];

    public function normalize(string $text): string
    {
        return trim(preg_replace('/[^a-z0-9]+/', ' ', mb_strtolower(Str::ascii($text))) ?? '');
    }

    public function tokens(string $text): array
    {
        $words = preg_split('/\\s+/', $this->normalize($text), -1, PREG_SPLIT_NO_EMPTY);

        return array_values(array_unique(array_filter(array_map(function (string $word): string {
            foreach (self::ALIASES as $canonical => $aliases) {
                if ($word === $canonical || in_array($word, $aliases, true)) {
                    return $canonical;
                }
                // Correct ordinary vocabulary only, never numbers or proper names.
                if (strlen($word) >= 6 && ctype_alpha($word) && levenshtein($word, $canonical) === 1) {
                    return $canonical;
                }
            }

            return $word;
        }, $words), fn (string $word): bool => ! in_array($word, self::STOP_WORDS, true))));
    }

    public function facet(string $question): ?string
    {
        return $this->facets($question)[0] ?? null;
    }

    public function facets(string $question): array
    {
        $tokens = $this->tokens($question);
        $normalized = $this->normalize($question);
        if (preg_match('/\b(how long|how much time|gaano katagal)\b/', $normalized)) {
            $tokens[] = 'duration';
        } elseif (str_contains($normalized, 'how much')) {
            $tokens[] = 'fee';
        }

        return array_values(array_intersect(['fee', 'hours', 'duration'], $tokens));
    }

    public function isFilipino(string $question): bool
    {
        return (bool) preg_match('/\\b(po|opo|ano|anong|paano|pano|magkano|saan|kailan|oras|bukas|pwede|puwede|kailangan|kelangan|ako|ba|yung|ang|ng|mga|may|tulong|salamat)\\b/i', $question);
    }

    public function isOfficeHours(string $question): bool
    {
        $tokens = $this->tokens($question);

        return $this->facet($question) === 'hours'
            && (in_array('office', $tokens, true) || str_contains($this->normalize($question), 'barangay'))
            && array_intersect($tokens, ['waste', 'evacuation', 'water', 'electric', 'flood', 'health']) === [];
    }

    public function retrieve(string $barangayId, string $question): array
    {
        $items = LibraryItem::query()->where('barangay_id', $barangayId)->where('is_active', true)
            ->whereIn('type', ['faq', 'manual', 'contact', 'emergency', 'evacuation_center'])
            ->orderBy('sort_order')->orderBy('id')
            ->get(['id', 'type', 'title', 'content', 'metadata', 'updated_at']);
        $templates = DocumentTemplate::query()->where('barangay_id', $barangayId)->where('is_enabled', true)
            ->orderBy('sort_order')->orderBy('id')->get(['id', 'name', 'key', 'resident_fields', 'updated_at']);
        $sources = $this->sources($items, $templates);

        return [
            'sources' => $this->rank($question, $sources),
            'contacts' => array_values(array_filter($sources, fn ($source): bool => in_array($source['type'], ['contact', 'emergency'], true) && $source['phone'] !== null)),
            'documents' => array_values(array_filter($sources, fn ($source): bool => $source['type'] === 'document')),
        ];
    }

    public function sources(Collection $items, ?Collection $templates = null): array
    {
        $sources = [];
        foreach ($items as $item) {
            $metadata = is_array($item->metadata) ? $item->metadata : [];
            $details = [];
            // Arbitrary metadata, including internal notes, never enters provider context.
            foreach (['phone', 'role', 'address', 'operating_hours', 'hours', 'schedule', 'subtitle', 'capacity', 'facilities'] as $field) {
                $value = $metadata[$field] ?? null;
                if (is_array($value)) {
                    $value = implode(', ', array_filter($value, fn ($part): bool => is_scalar($part)));
                }
                if (is_scalar($value) && trim((string) $value) !== '') {
                    $details[] = ucfirst(str_replace('_', ' ', $field)).': '.trim((string) $value);
                }
            }
            $phone = is_string($metadata['phone'] ?? null) ? trim($metadata['phone']) : '';
            $sources[] = [
                'id' => 'library:'.$item->id, 'title' => $item->title, 'type' => $item->type,
                'text' => trim(($item->content ?? '')."\n".implode("\n", $details)),
                'phone' => preg_match('/^[+()\\d\\s.\\/-]{3,50}$/', $phone) && strlen(preg_replace('/\\D/', '', $phone)) >= 3 ? $phone : null,
                'url' => '/library#library-'.$item->id,
                'updated_at' => $item->updated_at?->toIso8601String(),
            ];
        }
        foreach ($templates ?? [] as $template) {
            $labels = DocumentCatalog::fields();
            $fields = array_map(fn ($field): string => $labels[$field] ?? $field, $template->resident_fields ?? []);
            $sources[] = [
                'id' => 'document:'.$template->id, 'title' => $template->name, 'type' => 'document', 'key' => $template->key,
                'text' => 'Online request form fields: '.implode(', ', $fields).".\nTo request this document, open Documents, select Request this, complete the form, and submit. Track it under Your Requests. Wait for barangay review; open the request to print when it is ready. These are form fields, not a list of supporting documents or a guarantee of approval.",
                'phone' => null, 'url' => '/documents', 'updated_at' => $template->updated_at?->toIso8601String(),
            ];
        }

        return $sources;
    }

    public function rank(string $question, array $sources): array
    {
        $facets = $this->facets($question);
        $query = array_values(array_unique([...$this->tokens($question), ...$facets]));
        $topic = str_contains($question, "\nCurrent topic: ") ? explode("\nCurrent topic: ", $question, 2)[1] : null;
        $topicTokens = $topic === null ? [] : array_diff($this->tokens($topic), ['requirements', 'request', 'document', 'documents', 'form', 'forms', 'service', 'services', 'prepare', 'maghanda', 'para', 'dapat', 'help', 'explain', 'community', 'residents', 'resident', 'up']);
        $ranked = [];
        foreach ($sources as $source) {
            if ($source['text'] === '') {
                continue;
            }
            $title = $this->tokens($source['title']);
            $content = $this->tokens($source['text']);
            if ($topicTokens !== [] && array_intersect($topicTokens, array_merge($title, $content)) === []) {
                continue;
            }
            if ($facets !== [] && array_intersect($facets, array_merge($title, $content)) === []) {
                continue;
            }
            $subjects = array_diff($query, ['hours', 'fee', 'duration', 'contact', 'requirements', 'request', 'document', 'documents', 'service', 'services']);
            if ($facets !== [] && $subjects !== [] && array_intersect($subjects, array_merge($title, $content)) === []) {
                continue;
            }
            $score = count(array_intersect($query, $title)) * 4 + count(array_intersect($query, $content));
            if ($source['type'] === 'document' && array_intersect($query, $title) === []) {
                continue;
            }
            if ($score > 0) {
                $source['text'] = $this->excerpt($source['text'], $query);
                if ($source['text'] !== '') {
                    $ranked[] = ['score' => $score, 'source' => $source];
                }
            }
        }
        usort($ranked, fn ($a, $b): int => $b['score'] <=> $a['score']);

        return array_column(array_slice($ranked, 0, 6), 'source');
    }

    private function excerpt(string $text, array $query): string
    {
        if (mb_strlen($text) <= 2400) {
            return $text;
        }
        $passages = preg_split('/\\R+|(?<=[.!?])\\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
        usort($passages, fn ($a, $b): int => count(array_intersect($query, $this->tokens($b))) <=> count(array_intersect($query, $this->tokens($a))));
        $selected = [];
        $length = 0;
        foreach ($passages as $passage) {
            if ($length + mb_strlen($passage) <= 2400) {
                $selected[] = $passage;
                $length += mb_strlen($passage) + 1;
            }
        }

        // Never cut a local schedule, requirement, or number in the middle of a sentence.
        return implode("\n", $selected);
    }
}
