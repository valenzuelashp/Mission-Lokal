<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_status_history', function (Blueprint $table) {
            // Standard auto-incrementing integer for backend logs
            $table->id();
            
            $table->uuid('mission_id');
            
            // Status tracking
            $table->string('from_status', 32)->nullable();
            $table->string('to_status', 32);
            
            // The user (personnel/admin) who triggered the status change
            $table->uuid('actor_id')->nullable();
            
            // Optional context (e.g., why a mission was cancelled)
            $table->text('note')->nullable();
            
            // Log timestamp, no updated_at needed
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If the mission is deleted, delete its status history
            $table->foreign('mission_id')->references('id')->on('missions')->cascadeOnDelete();
            
            // Keep the log even if the user is deleted
            $table->foreign('actor_id')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Optimized for loading the mission's timeline chronologically
            $table->index(['mission_id', 'created_at'], 'idx_mission_status_hist');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_status_history');
    }
};