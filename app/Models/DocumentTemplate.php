<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentTemplate extends Model
{
    use HasUuids;

    protected $fillable = [
        'barangay_id',
        'key',
        'name',
        'body',
        'signatory_name',
        'signatory_title',
        'paper_size',
        'resident_fields',
        'is_enabled',
        'is_system',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'resident_fields' => 'array',
            'is_enabled' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    public function barangay(): BelongsTo
    {
        return $this->belongsTo(Barangay::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(DocumentRequest::class, 'template_id');
    }
}
