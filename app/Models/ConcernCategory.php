<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConcernCategory extends Model
{
    public $timestamps = false; // We set this to false because our DATABASE.md doesn't use created_at/updated_at here

    protected $fillable = [
        'barangay_id',
        'code',
        'name',
        'default_visibility',
        'sort_order',
        'is_active',
    ];
}