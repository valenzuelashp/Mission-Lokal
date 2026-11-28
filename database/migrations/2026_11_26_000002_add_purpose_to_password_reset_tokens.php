<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table): void {
            $table->string('purpose', 32)->default('password_reset');
            $table->index(['user_id', 'purpose'], 'idx_reset_user_purpose');
        });
    }

    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table): void {
            $table->dropIndex('idx_reset_user_purpose');
            $table->dropColumn('purpose');
        });
    }
};
