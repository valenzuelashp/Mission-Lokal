<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CategoryPlaybook extends Model
{
    use HasUuids; // This tells Laravel to automatically generate the CHAR(36) UUIDs we asked for in the migration

    public $timestamps = false;

    protected $fillable = [
        'subcategory_id',
        'title',
        'steps_template',
        'default_duration_hours',
        'default_due_days',
        'is_active',
    ];

    protected $casts = [
        'steps_template' => 'array', // This automatically converts the database JSON column into a usable PHP array
    ];
}