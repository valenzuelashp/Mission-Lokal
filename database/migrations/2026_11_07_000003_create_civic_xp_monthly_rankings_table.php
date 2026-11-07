<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('civic_xp_monthly_rankings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->uuid('user_id');
            $table->char('month', 7);
            $table->string('account_id', 64);
            $table->string('resident_name');
            $table->unsignedSmallInteger('civic_xp');
            $table->unsignedInteger('rank_position');
            $table->json('badges');
            $table->timestamp('snapshot_at');
            $table->unique(['barangay_id', 'month', 'user_id'], 'uk_civic_xp_monthly_resident');
            $table->index(['barangay_id', 'month', 'rank_position'], 'idx_civic_xp_monthly_ranking');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('civic_xp_monthly_rankings');
    }
};