<?php

namespace App\Enums;

enum AnnouncementKind: string
{
    case Advisory = 'advisory';
    case Event = 'event';
    case Volunteer = 'volunteer';

    public function label(): string
    {
        return match ($this) {
            self::Advisory => 'Advisory',
            self::Event => 'Event',
            self::Volunteer => 'Volunteer call',
        };
    }

    public function calendarSubtitle(bool $published): string
    {
        return $published ? $this->label() : 'Draft '.$this->label();
    }
}
