<?php

namespace App\Enums;

enum PersonnelShift: string
{
    case Morning = 'morning';
    case Evening = 'evening';
    case Overnight = 'overnight';

    public function label(): string
    {
        return match ($this) {
            self::Morning => 'Morning shift (8:00 AM - 4:00 PM)',
            self::Evening => 'Evening shift (4:00 PM - 12:00 AM)',
            self::Overnight => 'Overnight shift (12:00 AM - 8:00 AM)',
        };
    }

    public function hours(): string
    {
        return match ($this) {
            self::Morning => '8:00 AM - 4:00 PM',
            self::Evening => '4:00 PM - 12:00 AM',
            self::Overnight => '12:00 AM - 8:00 AM',
        };
    }

    public static function current(): self
    {
        $time = now(config('app.timezone'));
        $minutes = ((int) $time->format('G') * 60) + (int) $time->format('i');

        return match (true) {
            $minutes >= 8 * 60 && $minutes < 16 * 60 => self::Morning,
            $minutes >= 16 * 60 => self::Evening,
            default => self::Overnight,
        };
    }

    public static function options(): array
    {
        return array_map(fn (self $shift) => [
            'value' => $shift->value,
            'label' => $shift->label(),
        ], self::cases());
    }
}
