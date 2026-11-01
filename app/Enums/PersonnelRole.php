<?php

namespace App\Enums;

enum PersonnelRole: string
{
    case Tanod = 'tanod';
    case Lupon = 'lupon';
    case PublicWorks = 'public_works';
    case Sanitation = 'sanitation';
    case VawDesk = 'vaw_desk';
    case TrafficControl = 'traffic_control';
    case AnimalResponse = 'animal_response';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::Tanod => 'Tanod',
            self::Lupon => 'Lupon',
            self::PublicWorks => 'Utility & infrastructure',
            self::Sanitation => 'Sanitation',
            self::VawDesk => 'VAW Desk',
            self::TrafficControl => 'Traffic control',
            self::AnimalResponse => 'Animal response',
            self::Maintenance => 'Maintenance',
        };
    }

    public function department(): PersonnelDepartment
    {
        return match ($this) {
            self::Tanod, self::Lupon, self::VawDesk => PersonnelDepartment::PeaceOrder,
            self::PublicWorks => PersonnelDepartment::UtilityInfrastructure,
            self::Sanitation => PersonnelDepartment::Environmental,
            self::TrafficControl => PersonnelDepartment::TrafficManagement,
            self::AnimalResponse => PersonnelDepartment::TamboAnimalResponse,
            self::Maintenance => PersonnelDepartment::Maintenance,
        };
    }
}