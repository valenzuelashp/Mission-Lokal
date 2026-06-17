<?php

namespace App\Enums;

enum MissionStatus: string
{
    case Assigned = 'assigned';
    case Acknowledged = 'acknowledged';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Verified = 'verified';
    case Cancelled = 'cancelled';
}
