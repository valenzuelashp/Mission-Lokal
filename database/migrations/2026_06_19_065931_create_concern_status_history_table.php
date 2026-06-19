<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_status_history', function (Blueprint $table) {
            // Standard auto-incrementing integer for logs
            $table->id();
            
            // The concern being updated
            $table->uuid('concern_id');
            
            // Status tracking
            $table->string('from_status', 32)->nullable();
            $table->string('to_status', 32);
            
            // The user (admin/personnel) who made the change
            $table->uuid('actor_id')->nullable();
            
            // Optional context for the change
            $table->text('note')->nullable();
            
            // Only tracking when it happened, no updated_at needed
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            $table->foreign('concern_id')->references('id')->on('concerns')->cascadeOnDelete();
            
            // We use nullOnDelete so if an admin's account is ever deleted, 
            // the history record stays intact, it just loses the association to the deleted user.
            $table->foreign('actor_id')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Optimized for showing a timeline of events on a specific concern
            $table->index(['concern_id', 'created_at'], 'idx_concern_status_hist');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_status_history');
    }
};