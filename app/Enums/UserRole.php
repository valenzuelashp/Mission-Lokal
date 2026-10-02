<?php

namespace App\Enums;

enum UserRole: string
{
    case Resident = 'resident';
    case Personnel = 'personnel';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function label(): string
    {
        return match($this) {
            self::Resident => 'Resident',
            self::Personnel => 'Field Personnel',
            self::Admin => 'Barangay Admin',
            self::SuperAdmin => 'Super Administrator',
        };
    }
}