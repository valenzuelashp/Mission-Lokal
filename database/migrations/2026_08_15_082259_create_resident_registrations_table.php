<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resident_registrations', function (Blueprint $table) {
            $table->id();
            $table->char('barangay_id', 36)->nullable();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_extension', 20)->nullable();
            $table->date('birthday');
            $table->string('sex', 20);
            $table->string('civil_status', 30);
            $table->string('house_street');
            $table->string('barangay_name');
            $table->string('city');
            $table->string('province');
            $table->string('email')->unique();
            $table->string('mobile', 20);
            $table->string('government_id_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resident_registrations');
    }
};