<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ConcernReanalysis extends Model
{
    use HasUuids;

    protected $fillable = ['concern_id', 'requested_by', 'analysis_id', 'clarification_ids', 'status', 'error_message', 'completed_at'];

    protected function casts(): array
    {
        return ['clarification_ids' => 'array', 'completed_at' => 'datetime'];
    }
}
