<?php

namespace App\Enums;

enum UserRole: string
{
    case Resident = 'resident';
    case Personnel = 'personnel';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';
}

enum ConcernStatus: string
{
    case Submitted = 'submitted';
    case AiProcessed = 'ai_processed';
    case UnderReview = 'under_review';
    case Rejected = 'rejected';
    case Spam = 'spam';
    case Active = 'active';
    case Resolved = 'resolved';
    case Closed = 'closed';
}

enum MissionStatus: string
{
    case Assigned = 'assigned';
    case Acknowledged = 'acknowledged';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Verified = 'verified';
    case Cancelled = 'cancelled';
}
