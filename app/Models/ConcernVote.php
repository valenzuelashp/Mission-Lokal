<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernVote extends Model
{
    use HasFactory; // Notice we removed HasUuids here!

    protected $table = 'concern_votes';

    // Because this table uses a composite primary key instead of a single 'id' column,
    // we need to tell Laravel Eloquent not to look for an 'id' or try to auto-increment it.
    public $incrementing = false;
    protected $primaryKey = null;

    protected $fillable = [
        'concern_id',
        'user_id',
        'vote',
    ];

    protected function casts(): array
    {
        return [
            'vote' => 'integer',
        ];
    }

    // --- Relationships ---

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}