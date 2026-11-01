<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('personnel', 'category') && ! Schema::hasColumn('personnel', 'role')) {
            Schema::table('personnel', function (Blueprint $table) {
                $table->renameColumn('category', 'role');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('personnel', 'role') && ! Schema::hasColumn('personnel', 'category')) {
            Schema::table('personnel', function (Blueprint $table) {
                $table->renameColumn('role', 'category');
            });
        }
    }
};
