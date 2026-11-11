<?php

namespace App\Support;

use App\Models\Mission;

class MissionWorkload
{
    public const ACTIVE_STATUSES = ['assigned', 'acknowledged', 'in_progress'];

    public static function isPastDue(?Mission $mission): bool
    {
        if (! $mission || ! in_array($mission->status->value, self::ACTIVE_STATUSES, true)) {
            return false;
        }

        return (bool) $mission->is_overdue
            || ($mission->due_date !== null && $mission->due_date->lt(today()));
    }
}
