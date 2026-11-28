<?php

namespace App\Enums;

enum ConcernCategoryCode: string
{
    case Traffic = 'TRAFFIC';
    case Waste = 'WASTE';
    case Noise = 'NOISE';
    case Vawc = 'VAWC';
    case Infrastructure = 'INFRA';
    case Drainage = 'DRAINAGE';
    case Animals = 'ANIMALS';
    case Property = 'PROPERTY';
    case Other = 'OTHER';

    public function label(): string
    {
        return match ($this) {
            self::Traffic => 'Traffic & Vehicle Violations',
            self::Waste => 'Solid Waste & Illegal Dumping',
            self::Noise => 'Noise & Public Disturbance',
            self::Vawc => 'VAWC & Domestic Disputes',
            self::Infrastructure => 'Road, Utility & Infrastructure',
            self::Drainage => 'Flooding & Drainage',
            self::Animals => 'Stray Animals & Bites',
            self::Property => 'Barangay Property & Maintenance',
            self::Other => 'Other (Non-Emergency)',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Traffic => 'Illegal parking, stalled vehicles, traffic congestion, reckless driving',
            self::Waste => 'Uncollected garbage, illegal dumping, sanitation hazards',
            self::Noise => 'Loud karaoke/parties, public intoxication, neighborhood disputes',
            self::Vawc => 'Domestic abuse, violence against women/children, family altercations',
            self::Infrastructure => 'Potholes, damaged roads/sidewalks, broken streetlights, exposed wires, water/power issues',
            self::Drainage => 'Clogged canals/drainage, street flooding, overflowing manholes',
            self::Animals => 'Stray dogs/cats, non-life-threatening animal bites, injured/abandoned animals',
            self::Property => 'Repairs or upkeep of barangay-owned buildings, halls, parks, and equipment',
            self::Other => 'General non-emergency concerns that do not fit the categories above',
        };
    }

    public function department(): ?PersonnelDepartment
    {
        return match ($this) {
            self::Traffic => PersonnelDepartment::TrafficManagement,
            self::Waste => PersonnelDepartment::Environmental,
            self::Noise, self::Vawc => PersonnelDepartment::PeaceOrder,
            self::Infrastructure, self::Drainage => PersonnelDepartment::UtilityInfrastructure,
            self::Animals => PersonnelDepartment::TamboAnimalResponse,
            self::Property => PersonnelDepartment::Maintenance,
            self::Other => null,
        };
    }

    public function roles(): array
    {
        return match ($this) {
            self::Traffic => ['traffic_control'],
            self::Waste => ['sanitation'],
            self::Noise => ['tanod', 'lupon'],
            self::Vawc => ['vaw_desk', 'lupon'],
            self::Infrastructure, self::Drainage => ['public_works'],
            self::Animals => ['animal_response'],
            self::Property => ['maintenance'],
            self::Other => ['admin'],
        };
    }

    public function routing(): array
    {
        return ['routed_department' => $this->department()?->value ?? 'admin_triage', 'routed_roles' => $this->roles()];
    }

    public static function options(): array
    {
        return array_map(fn (self $category) => [
            'value' => strtolower($category->value), 'label' => $category->label(),
            'description' => $category->description(), 'force_private' => $category === self::Vawc,
        ], self::cases());
    }
}
