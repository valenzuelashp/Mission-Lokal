<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class LoginActivity extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['user_id', 'barangay_id', 'account_id', 'user_name', 'role', 'ip_address', 'user_agent', 'browser', 'device', 'approximate_location', 'signed_in_at'];

    protected function casts(): array
    {
        return ['signed_in_at' => 'datetime'];
    }
}
