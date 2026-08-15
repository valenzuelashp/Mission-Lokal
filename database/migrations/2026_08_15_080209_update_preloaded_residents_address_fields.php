<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            // Drop old generic address column if it exists
            if (Schema::hasColumn('preloaded_residents', 'address')) {
                $table->dropColumn('address');
            }
            // Add detailed address breakdown fields
            $table->string('house_street')->nullable()->after('birthday');
            $table->string('barangay_name')->nullable()->after('house_street');
            $table->string('city')->nullable()->after('barangay_name');
            $table->string('province')->nullable()->after('city');
        });
    }

    public function down(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            $table->text('address')->nullable();
            $table->dropColumn(['house_street', 'barangay_name', 'city', 'province']);
        });
    }
};