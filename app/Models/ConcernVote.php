<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernVote extends Model
{
    use HasFactory;

    protected $table = 'concern_votes';

    // Disable auto-incrementing since this table uses a composite primary key (concern_id + user_id)
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

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}