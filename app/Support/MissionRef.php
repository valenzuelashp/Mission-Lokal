<?php

namespace App\Support;

class MissionRef
{
    public static function label(?string $id): string
    {
        $compact = strtoupper(substr(str_replace('-', '', (string) $id), 0, 8));

        return 'MS-'.$compact;
    }
}
