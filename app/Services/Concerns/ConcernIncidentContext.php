<?php

namespace App\Services\Concerns;

use App\Models\Concern;
use Carbon\CarbonImmutable;
use Illuminate\Container\Container;
use Illuminate\Support\Facades\DB;

class ConcernIncidentContext
{
    private const TERMS = [
        'basketball court' => 'court', 'basketbolan' => 'court', 'basketbol' => 'court',
        'street light' => 'streetlight', 'street lights' => 'streetlight', 'sirang ilaw' => 'broken streetlight',
        'baradong kanal' => 'blocked drainage', 'clogged drain' => 'blocked drainage',
        'clogged drainage' => 'blocked drainage', 'blocked drain' => 'blocked drainage',
        'kanal' => 'drainage', 'drain' => 'drainage', 'barado' => 'blocked', 'baradong' => 'blocked',
        'nakabara' => 'blocked', 'clogged' => 'blocked', 'clog' => 'blocked',
        'basura' => 'waste', 'garbage' => 'waste', 'trash' => 'waste', 'rubbish' => 'waste',
        'baha' => 'flood', 'bumabaha' => 'flood', 'pagbaha' => 'flood', 'flooding' => 'flood', 'flooded' => 'flood',
        'sirang' => 'broken', 'sira' => 'broken', 'damaged' => 'broken',
        'streetlights' => 'streetlight', 'lubak' => 'pothole', 'butas' => 'pothole', 'potholes' => 'pothole',
        'sunog' => 'fire', 'nasusunog' => 'fire', 'ingay' => 'noise', 'maingay' => 'noise',
        'videoke' => 'karaoke', 'kalsada' => 'road', 'kalye' => 'street', 'tubig' => 'water',
        'palengke' => 'market', 'paaralan' => 'school', 'eskwelahan' => 'school', 'tulay' => 'bridge',
    ];

    private const STOP_WORDS = [
        'a', 'an', 'and', 'ang', 'at', 'but', 'by', 'for', 'from', 'here', 'in', 'is', 'it', 'na', 'ng',
        'of', 'on', 'or', 'po', 'sa', 'the', 'there', 'this', 'to', 'with', 'yung', 'mga', 'may', 'please',
        'reported', 'report', 'problem', 'issue', 'concern', 'dito', 'doon', 'amin', 'namin', 'near', 'beside',
        'malapit', 'katabi', 'tapat', 'bandang', 'isang', 'iyong', 'rin', 'din', 'still', 'remains', 'our', 'are',
    ];

    public function tokens(string $text): array
    {
        $text = mb_strtolower($text);
        $terms = self::TERMS;
        uksort($terms, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));
        $pattern = '/(?<![\p{L}\p{N}])('.implode('|', array_map(fn ($term) => preg_quote($term, '/'), array_keys($terms))).')(?![\p{L}\p{N}])/u';
        $text = preg_replace_callback($pattern, fn ($match) => $terms[$match[1]], $text);
        $words = preg_split('/[^\p{L}\p{N}]+/u', $text, -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return array_values(array_unique(array_filter($words, fn ($word) => mb_strlen($word) > 2 && ! in_array($word, self::STOP_WORDS, true))));
    }

    public function topic(string $text): string
    {
        $tokens = $this->tokens($text);
        foreach (['fire', 'drainage', 'flood', 'streetlight', 'pothole', 'waste', 'noise'] as $topic) {
            if (in_array($topic, $tokens, true) || ($topic === 'noise' && in_array('karaoke', $tokens, true))) {
                return $topic;
            }
        }

        return 'other';
    }

    public function windowHours(string $topic): int
    {
        $defaults = ['fire' => 24, 'noise' => 24, 'flood' => 72, 'drainage' => 168, 'waste' => 168, 'streetlight' => 720, 'pothole' => 720];
        if (Container::getInstance()->bound('config')) {
            return max(1, (int) config('concerns.topic_window_hours.'.$topic, config('concerns.duplicate_window_hours', 168)));
        }

        return $defaults[$topic] ?? 168;
    }

    public function occurredAt(Concern $concern): CarbonImmutable
    {
        return CarbonImmutable::parse($concern->incident_occurred_at ?? $concern->created_at ?? now());
    }

    public function areaLabel(?string $address): ?string
    {
        $address = trim((string) $address);
        if ($address === '' || preg_match('/^(?:coordinates|pinned location)\b/i', $address)) {
            return null;
        }
        $parts = array_map('trim', explode(',', $address));
        $label = collect($parts)->first(fn ($part) => preg_match('/\b(street|st\.?|road|rd\.?|avenue|ave\.?|lane|drive|purok|sitio|zone)\b/iu', $part)) ?? $parts[0];
        $label = preg_replace('/^(?:near|beside|opposite|malapit\s+sa|katabi\s+ng|tapat\s+ng)\s+/iu', '', $label);
        $label = preg_replace('/^(?:#\s*)?\d+[A-Za-z]?(?:-\d+)?\s+(?=\p{L})/u', '', $label);
        $label = preg_replace(['/\bSt\.?$/iu', '/\bRd\.?$/iu', '/\bAve\.?$/iu'], ['Street', 'Road', 'Avenue'], $label);

        return mb_substr(trim(preg_replace('/\s+/u', ' ', $label)), 0, 120) ?: null;
    }

    public function point(Concern $concern): ?array
    {
        if (is_numeric($concern->getAttribute('context_x')) && is_numeric($concern->getAttribute('context_y'))) {
            return $this->normalizePoint((float) $concern->context_x, (float) $concern->context_y);
        }
        $location = $concern->getRawOriginal('location') ?? $concern->getAttribute('location');
        if (! is_string($location) || $location === '') {
            return null;
        }
        if (preg_match('/POINT\s*\(\s*([-+\d.]+)\s+([-+\d.]+)\s*\)/i', $location, $match)) {
            return $this->normalizePoint((float) $match[1], (float) $match[2]);
        }
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            $row = DB::table('concerns')->where('id', $concern->id)->selectRaw('ST_X(location) as x, ST_Y(location) as y')->first();

            return $row && $row->x !== null && $row->y !== null ? $this->normalizePoint((float) $row->x, (float) $row->y) : null;
        }

        return null;
    }

    public function distanceMeters(array $first, array $second): float
    {
        $lat = deg2rad($second['lat'] - $first['lat']);
        $lng = deg2rad($second['lng'] - $first['lng']);
        $a = sin($lat / 2) ** 2 + cos(deg2rad($first['lat'])) * cos(deg2rad($second['lat'])) * sin($lng / 2) ** 2;

        return 6371000 * 2 * asin(sqrt(min(1, max(0, $a))));
    }

    private function normalizePoint(float $x, float $y): ?array
    {
        // Existing Philippine locations use both GIS axis conventions.
        [$lat, $lng] = abs($x) <= 90 && abs($y) > 90 ? [$x, $y] : [$y, $x];

        return is_finite($lat) && is_finite($lng) && abs($lat) <= 90 && abs($lng) <= 180
            ? ['lat' => $lat, 'lng' => $lng] : null;
    }
}
