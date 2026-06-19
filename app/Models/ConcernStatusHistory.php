<?php

namespace App\Models;

use App\Enums\ConcernStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernStatusHistory extends Model
{
    use HasFactory; 

    protected $table = 'concern_status_history';

    // Disable the auto-updating 'updated_at' column
    public const UPDATED_AT = null;

    protected $fillable = [
        'concern_id',
        'from_status',
        'to_status',
        'actor_id',
        'note',
    ];

    protected function casts(): array
    {
        return [
            // Automatically cast the string statuses back to your PHP Enum
            'from_status' => ConcernStatus::class,
            'to_status' => ConcernStatus::class,
            'created_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function actor(): BelongsTo
    {
        // Associates 'actor_id' with the User model
        return $this->belongsTo(User::class, 'actor_id');
    }
}