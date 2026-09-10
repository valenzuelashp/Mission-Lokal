<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernVote extends Model
{
    use HasFactory;

    protected $table = 'concern_votes';

    public $incrementing = false;

    protected $primaryKey = ['concern_id', 'user_id'];

    protected $keyType = 'string';

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

    protected function setKeysForSaveQuery($query)
    {
        return $query
            ->where('concern_id', $this->getAttribute('concern_id'))
            ->where('user_id', $this->getAttribute('user_id'));
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