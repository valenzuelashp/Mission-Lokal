<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->string('sex')->nullable()->after('birthday');
            $table->string('civil_status')->nullable()->after('sex');
            $table->string('house_street')->nullable()->after('address');
            $table->string('barangay_name')->nullable()->after('house_street');
            $table->string('city')->nullable()->after('barangay_name');
            $table->string('province')->nullable()->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->dropColumn([
                'sex',
                'civil_status',
                'house_street',
                'barangay_name',
                'city',
                'province',
            ]);
        });
    }
};
