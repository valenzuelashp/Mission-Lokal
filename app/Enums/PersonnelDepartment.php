<?php

namespace App\Enums;

enum PersonnelDepartment: string
{
    case TrafficManagement = 'traffic_management';
    case Environmental = 'environmental';
    case PeaceOrder = 'peace_order';
    case UtilityInfrastructure = 'utility_infrastructure';
    case TamboAnimalResponse = 'tambo_animal_response';
    case Maintenance = 'maintenance';

    public function label(): string
    {
        return match ($this) {
            self::TrafficManagement => 'Traffic Management',
            self::Environmental => 'Environmental',
            self::PeaceOrder => 'Peace & Order',
            self::UtilityInfrastructure => 'Utility & Infrastructure',
            self::TamboAnimalResponse => 'Animal Response Team',
            self::Maintenance => 'Maintenance',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::TrafficManagement => 'Road obstructions, traffic control, and safe passage.',
            self::Environmental => 'Sanitation, waste collection, and environmental concerns.',
            self::PeaceOrder => 'Tanod response, Lupon mediation, and confidential VAW Desk cases.',
            self::UtilityInfrastructure => 'Utility and infrastructure concerns across the barangay.',
            self::TamboAnimalResponse => 'Animal response, welfare, and community safety.',
            self::Maintenance => 'Electrical, drainage, and minor infrastructure repairs.',
        };
    }
}
