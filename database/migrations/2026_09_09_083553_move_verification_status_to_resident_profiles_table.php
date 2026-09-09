<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'verification_status')) {
                $table->dropColumn('verification_status');
            }
        });

        Schema::table('resident_profiles', function (Blueprint $table) {
            if (!Schema::hasColumn('resident_profiles', 'verification_status')) {
                $table->string('verification_status')->default('unverified')->after('user_id');
            }
            if (!Schema::hasColumn('resident_profiles', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('verification_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->dropColumn(['verification_status', 'rejection_reason']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('verification_status')->default('unverified');
        });
    }
};