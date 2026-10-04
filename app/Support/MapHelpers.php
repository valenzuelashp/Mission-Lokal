<?php

namespace App\Support;

use Illuminate\Database\Query\Expression;
use Illuminate\Support\Facades\DB;

class MapHelpers
{
    /**
     * Standard MariaDB/MySQL GIS WKT: POINT(longitude latitude)
     * ST_X() represents Longitude, ST_Y() represents Latitude.
     */
    public static function pointFromLatLng(float $lat, float $lng): Expression
    {
        // If swapped by accident, normalize them
        if (abs($lat) > 90 && abs($lng) <= 90) {
            $temp = $lat;
            $lat = $lng;
            $lng = $temp;
        }

        $safeLat = max(-90.0, min(90.0, $lat));
        $safeLng = max(-180.0, min(180.0, $lng));

        // Format as POINT(longitude latitude)
        return DB::raw(sprintf("ST_GeomFromText('POINT(%F %F)', 4326)", $safeLng, $safeLat));
    }

    public static function latLngSelect(string $column = 'location'): Expression
    {
        // ST_Y is latitude, ST_X is longitude
        return DB::raw("ST_Y({$column}) as lat, ST_X({$column}) as lng");
    }

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