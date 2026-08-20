<?php

namespace App\Support;

class MapHelpers
{
    public static function scoreFromSeverity(?string $severity): int
    {
        return match ($severity) {
            'critical' => 92,
            'high' => 78,
            'medium' => 50,
            'low' => 22,
            default => 50,
        };
    }

    public static function priorityFromSeverity(?string $severity): string
    {
        return match ($severity) {
            'critical', 'high' => 'high',
            'low' => 'low',
            default => 'med',
        };
    }

    public static function queueStatusFromMission(?string $status): string
    {
        return match ($status) {
            'in_progress' => 'ongoing',
            'completed', 'verified' => 'done',
            default => 'seen',
        };
    }

    public static function typeIconFromText(?string ...$parts): string
    {
        $haystack = strtolower(implode(' ', array_filter($parts)));

        return match (true) {
            str_contains($haystack, 'flood') || str_contains($haystack, 'water') => 'flood',
            str_contains($haystack, 'drain') => 'drainage',
            str_contains($haystack, 'waste') || str_contains($haystack, 'dump') || str_contains($haystack, 'garbage') || str_contains($haystack, 'trash') => 'waste',
            str_contains($haystack, 'noise') => 'noise',
            str_contains($haystack, 'fire') || str_contains($haystack, 'hazard') => 'fire',
            str_contains($haystack, 'light') || str_contains($haystack, 'lamp') => 'light',
            default => 'drainage',
        };
    }

    public static function activityIcon(?string $action): string
    {
        $action = strtolower((string) $action);

        return match (true) {
            str_contains($action, 'confirm') || str_contains($action, 'ai') => 'ai',
            str_contains($action, 'reject') || str_contains($action, 'merge') => 'user',
            str_contains($action, 'verif') || str_contains($action, 'complete') => 'success',
            default => 'system',
        };
    }
}
