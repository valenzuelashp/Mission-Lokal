<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreloadedResident extends Model
{
    use HasFactory;

    protected $fillable = [
        'account_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_extension',
        'birthday',
        'address',
        'email',
        'mobile',
        'is_claimed',
    ];
}