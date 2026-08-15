<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            $table->string('sex', 20)->nullable()->after('name_extension');
        });
    }

    public function down(): void
    {
        Schema::table('preloaded_residents', function (Blueprint $table) {
            $table->dropColumn('sex');
        });
    }
};