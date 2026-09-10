<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            if (! Schema::hasColumn('preloaded_residents', 'civil_status')) {
                $table->string('civil_status', 30)->nullable()->after('sex');
            }
        });
    }

    public function down(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            if (Schema::hasColumn('preloaded_residents', 'civil_status')) {
                $table->dropColumn('civil_status');
            }
        });
    }
};
