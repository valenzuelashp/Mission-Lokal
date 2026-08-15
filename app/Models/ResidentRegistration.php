<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ResidentRegistration extends Model
{
    use HasFactory;

    protected $table = 'resident_registrations';

    protected $fillable = [
        'barangay_id',
        'first_name',
        'middle_name',
        'last_name',
        'name_extension',
        'birthday',
        'sex',
        'civil_status',
        'house_street',
        'barangay_name',
        'city',
        'province',
        'email',
        'mobile',
        'government_id_path',
    ];
}