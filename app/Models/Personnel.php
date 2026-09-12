<?php

namespace App\Models;

use App\Enums\PersonnelCategory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Model;

class Personnel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'personnel';

    protected $fillable = [
        'user_id',
        'birthday',
        'category',
        'registered_zone',
        'last_known_location',
        'location_updated_at',
        'sms_enabled',
        'is_active',
    ];

    protected $casts = [
        'birthday' => 'date',
        'category' => PersonnelCategory::class,
        'is_active' => 'boolean',
        'sms_enabled' => 'boolean',
        'location_updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class, 'barangay_id')->through('user');
    }

    public function missions(): BelongsToMany
    {
        return $this->belongsToMany(Mission::class, 'mission_personnel', 'personnel_id', 'mission_id')
                    ->withPivot(['id', 'assigned_by', 'status', 'acknowledged_at', 'completed_at', 'sms_sent_at'])
                    ->withTimestamps();
    }
}