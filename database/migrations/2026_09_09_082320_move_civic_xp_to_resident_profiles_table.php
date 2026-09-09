<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Remove civic_xp from users table
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'civic_xp')) {
                $table->dropColumn('civic_xp');
            }
        });

        // 2. Add civic_xp to resident_profiles table
        Schema::table('resident_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('resident_profiles', 'civic_xp')) {
                $table->unsignedInteger('civic_xp')->default(0)->after('user_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->dropColumn('civic_xp');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('civic_xp')->default(0);
        });
    }
};