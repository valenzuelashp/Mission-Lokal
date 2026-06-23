<?php

namespace App\Enums;

enum VerificationStatus: string
{
    case Unverified = 'unverified';
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Approved = 'approved';
    case Rejected = 'rejected';
}
