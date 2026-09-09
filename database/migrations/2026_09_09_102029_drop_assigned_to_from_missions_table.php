<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            // Drop the foreign key constraint first (Laravel convention is table_column_foreign)
            $table->dropForeign(['assigned_to']);
            
            // Drop the column
            $table->dropColumn('assigned_to');
        });
    }

    public function down(): void
    {
        Schema::table('missions', function (Blueprint $table) {
            $table->char('assigned_to', 36)->nullable();
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }
};