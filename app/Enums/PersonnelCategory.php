<?php

namespace App\Enums;

enum PersonnelCategory: string
{
    case Tanod = 'tanod';
    case Lupon = 'lupon';
    case PublicWorks = 'public_works';
    case Sanitation = 'sanitation';
    case VawDesk = 'vaw_desk';

    public function label(): string
    {
        return match ($this) {
            self::Tanod => 'Tanod',
            self::Lupon => 'Lupon',
            self::PublicWorks => 'Public works',
            self::Sanitation => 'Sanitation',
            self::VawDesk => 'VAW Desk',
        };
    }
}