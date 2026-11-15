<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConcernClarification extends Model
{
    use HasUuids;

    protected $fillable = ['concern_id', 'requested_by', 'questions', 'response', 'answered_at'];

    protected function casts(): array
    {
        return ['questions' => 'array', 'answered_at' => 'datetime'];
    }

    public function concern(): BelongsTo
    {
        return $this->belongsTo(Concern::class);
    }

    public function toThreadEntry(): array
    {
        return [
            'id' => $this->id,
            'questions' => $this->questions,
            'response' => $this->response,
            'requested_at' => $this->created_at?->format('M j, Y g:i A'),
            'answered_at' => $this->answered_at?->format('M j, Y g:i A'),
        ];
    }
}
