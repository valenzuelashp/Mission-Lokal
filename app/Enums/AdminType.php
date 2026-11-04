<?php

namespace App\Enums;

enum AdminType: string
{
    case General = 'general';
    case RadioRoom = 'radio_room';

    public function label(): string
    {
        return match ($this) {
            self::General => 'General Main Admin',
            self::RadioRoom => 'Radio Room Admin',
        };
    }
}