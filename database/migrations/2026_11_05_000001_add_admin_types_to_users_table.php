<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('admin_type', 24)->nullable()->after('role');
        });

        DB::table('users')
            ->where('role', 'admin')
            ->where('is_view_only', false)
            ->update(['admin_type' => 'general']);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('admin_type');
        });
    }
};