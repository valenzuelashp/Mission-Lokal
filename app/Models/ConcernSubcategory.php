<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConcernSubcategory extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'category_id',
        'code',
        'name',
        'force_private',
        'is_active',
    ];
}