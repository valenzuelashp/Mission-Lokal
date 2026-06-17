<?php

namespace App\Enums;

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
