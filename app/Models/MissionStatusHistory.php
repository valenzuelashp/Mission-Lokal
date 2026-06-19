<?php

namespace App\Models;

use App\Enums\MissionStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MissionStatusHistory extends Model
{
    use HasFactory; 

    protected $table = 'mission_status_history';

    // Disable the auto-updating 'updated_at' column
    public const UPDATED_AT = null;

    protected $fillable = [
        'mission_id',
        'from_status',
        'to_status',
        'actor_id',
        'note',
    ];

    protected function casts(): array
    {
        return [
            // Automatically cast the string statuses back to your PHP Enum
            'from_status' => MissionStatus::class,
            'to_status' => MissionStatus::class,
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function mission(): BelongsTo
    {
        return $this->belongsTo(Mission::class);
    }

    public function actor(): BelongsTo
    {
        // Associates 'actor_id' with the User model
        return $this->belongsTo(User::class, 'actor_id');
    }
}