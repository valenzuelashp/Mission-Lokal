<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            // Drop standard Laravel layout parameters safely
            $table->dropColumn(['email', 'token']);
            
            // Apply your exact structural custom database layer attributes
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->char('otp_hash', 64);
            $table->datetime('expires_at', 3);
            $table->datetime('used_at', 3)->nullable();
            
            // Attach foreign key tracking constraints back to your users table
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'expires_at'], 'idx_reset_user_expiry');
        });
    }

    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['id', 'user_id', 'otp_hash', 'expires_at', 'used_at']);
            
            $table->string('email')->primary();
            $table->string('token');
        });
    }
};