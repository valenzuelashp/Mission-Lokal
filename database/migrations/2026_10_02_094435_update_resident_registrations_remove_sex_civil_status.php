<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('resident_registrations', function (Blueprint $table) {
            if (Schema::hasColumn('resident_registrations', 'sex')) {
                $table->dropColumn('sex');
            }
            if (Schema::hasColumn('resident_registrations', 'civil_status')) {
                $table->dropColumn('civil_status');
            }
            if (!Schema::hasColumn('resident_registrations', 'consent_given_at')) {
                $table->timestamp('consent_given_at')->nullable();
            }
        });

        Schema::table('resident_profiles', function (Blueprint $table) {
            if (Schema::hasColumn('resident_profiles', 'sex')) {
                $table->dropColumn('sex');
            }
            if (Schema::hasColumn('resident_profiles', 'civil_status')) {
                $table->dropColumn('civil_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('resident_registrations', function (Blueprint $table) {
            $table->string('sex', 20)->nullable();
            $table->string('civil_status', 30)->nullable();
            $table->dropColumn('consent_given_at');
        });
    }
};