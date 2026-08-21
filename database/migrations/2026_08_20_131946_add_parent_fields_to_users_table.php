<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->char('parent_user_id', 36)->nullable()->after('barangay_id');
            $table->string('parent_name')->nullable()->after('parent_user_id');
            $table->string('parent_contact', 20)->nullable()->after('parent_name');

            // Foreign key linking minor to parent user account if registered
            $table->foreign('parent_user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['parent_user_id']);
            $table->dropColumn(['parent_user_id', 'parent_name', 'parent_contact']);
        });
    }
};