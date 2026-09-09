<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class MissionPersonnel extends Pivot
{
    protected $table = 'mission_personnel';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'mission_id',
        'personnel_id',
        'assigned_by',
        'status',
        'acknowledged_at',
        'completed_at',
        'sms_sent_at',
    ];
}