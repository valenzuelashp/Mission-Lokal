<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Barangay extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'code',
        'name',
        'boundary',
        'contact_phone',
        'contact_email',
        'office_hours',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'boundary' => 'array',
            'office_hours' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function settings(): HasOne
    {
        return $this->hasOne(BarangaySetting::class);
    }
}
