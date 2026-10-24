<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('civic_xp_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('barangay_id')->constrained('barangays')->cascadeOnDelete();
            $table->string('action', 64);
            $table->integer('points');
            $table->string('reference_type', 32);
            $table->char('reference_id', 36);
            $table->timestamp('created_at');

            // This unique key is the magic that completely prevents double-awarding!
            $table->unique(['user_id', 'action', 'reference_type', 'reference_id'], 'uk_civic_xp_idempotent');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('civic_xp_events');
    }
};