<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BarangaySetting extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'barangay_id';

    protected $fillable = [
        'barangay_id',
        'ack_timeout_hours',
        'duplicate_geo_radius_m',
        'duplicate_time_window_h',
        'auto_sms_nearby_radius_m',
        'max_personnel_sms_per_mission',
        'civic_xp_per_valid_report',
        'civic_xp_per_resolution',
        'civic_xp_per_upvote',
        'location_fuzz_meters',
        'sms_sender_id',
    ];

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }
}
