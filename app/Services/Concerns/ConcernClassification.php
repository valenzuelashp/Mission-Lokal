<?php

namespace App\Services\Concerns;

use App\Enums\ConcernCategoryCode;
use App\Models\Concern;

class ConcernClassification
{
    public const EMERGENCY_NOTICE = 'Active emergencies and crimes in progress are outside this system\'s scope. Contact 911 immediately, or BFP for a fire or PNP for a crime or violent emergency. Do not wait for a response here.';

    /** Conservative text screening; the AI performs a second contextual assessment. */
    public function isActiveEmergency(string $text): bool
    {
        $sentences = preg_split('/[.!?\n]+/u', mb_strtolower($text), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        foreach ($sentences as $sentence) {
            if (preg_match('/\b(no active|not (?:an? )?(?:active|ongoing)|no ongoing|not on fire|no fire|walang (?:sunog|holdap)|extinguished|already out|last (?:week|month|year)|yesterday|kahapon|nakaraang|naapula|patay na ang apoy|fire drill|sunog drill)\b/u', $sentence)) {
                continue;
            }
            if (preg_match('/\b(active fire|ongoing fire|on fire|burning (?:house|building)|nasusunog|kasalukuyang sunog|sunog ngayon|ongoing (?:robbery|shooting|assault)|(?:robbery|shooting|assault|holdap|nakawan|barilan) (?:is )?(?:in progress|happening|ongoing|ngayon)|(?:being|getting) robbed|hinaholdap|binabaril|cannot breathe|can\'t breathe|hindi makahinga|unconscious|bleeding (?:heavily|profusely)|trapped (?:in|by) (?:fire|flood)|nalulunod|drowning|(?<!non-)(?<!non )(?<!not )life[- ]threatening)\b/u', $sentence)) {
                return true;
            }
        }

        return false;
    }

    public function category(string $title, string $description): ?ConcernCategoryCode
    {
        $text = mb_strtolower($title.' '.$description);
        if (Concern::isVawcReport(null, $title, $description)) {
            return ConcernCategoryCode::Vawc;
        }
        foreach ([
            'PROPERTY' => '/\b(barangay[- ]owned|barangay hall|barangay (?:park|building|equipment)|barangay property|covered court|bulwagang barangay)\b/u',
            'DRAINAGE' => '/\b(flood(?:ing|ed)?|baha|bumabaha|pagbaha|drain(?:age)?|canal|kanal|manhole|imburnal)\b/u',
            'ANIMALS' => '/\b(stray|dog|dogs|cat|cats|animal|animals|aso|pusa|kagat|nakagat)\b/u',
            'TRAFFIC' => '/\b(parking|traffic|stalled vehicle|reckless driv\w*|road obstruction|blocked road|nakaparada|trapiko)\b/u',
            'WASTE' => '/\b(garbage|dumping|waste|trash|rubbish|basura|sanitation)\b/u',
            'NOISE' => '/\b(noise|karaoke|videoke|loud (?:music|party)|intoxicat\w*|neighbou?rhood dispute|ingay|maingay|lasing)\b/u',
            'INFRA' => '/\b(pothole|road|sidewalk|streetlight|street light|wire|power|water|utility|utilities|lubak|kalsada|ilaw|kuryente|tubig)\b/u',
        ] as $code => $pattern) {
            if (preg_match($pattern, $text)) {
                return ConcernCategoryCode::from($code);
            }
        }

        return null;
    }
}
