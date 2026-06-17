<?php

namespace App\Enums;

enum UserRole: string
{
    case Resident = 'resident';
    case Personnel = 'personnel';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';
}
