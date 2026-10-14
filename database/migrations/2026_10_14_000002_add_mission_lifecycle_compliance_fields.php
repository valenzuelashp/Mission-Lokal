<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mission_assignments', function (Blueprint $table) {
            $table->dateTime('acknowledged_at', 3)->nullable();
        });

        Schema::table('mission_proof', function (Blueprint $table) {
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('location_accuracy_m', 8, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mission_proof', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'location_accuracy_m']);
        });

        Schema::table('mission_assignments', function (Blueprint $table) {
            $table->dropColumn('acknowledged_at');
        });
    }
};