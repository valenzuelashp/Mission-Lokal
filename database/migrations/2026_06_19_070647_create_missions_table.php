<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('missions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Core references
            $table->uuid('barangay_id');
            $table->uuid('concern_id');
            
            // Assignment and Action Plan
            $table->uuid('assigned_to')->nullable();
            $table->uuid('playbook_id')->nullable(); // Links to category prescriptive steps
            
            // Scheduling
            $table->date('due_date')->nullable();
            $table->unsignedSmallInteger('estimated_duration_hours')->nullable();
            
            // Status and Flags
            $table->enum('status', ['assigned', 'acknowledged', 'in_progress', 'completed', 'verified', 'cancelled'])->default('assigned');
            $table->boolean('is_overdue')->default(false);
            $table->boolean('is_escalated')->default(false);
            
            // Timestamps for the mission lifecycle
            $table->dateTime('acknowledged_at', 3)->nullable();
            $table->dateTime('completed_at', 3)->nullable();
            $table->dateTime('verified_at', 3)->nullable();
            
            // Staff tracking
            $table->uuid('verified_by')->nullable();
            $table->text('closed_summary')->nullable(); // The message sent back to the resident
            $table->uuid('created_by'); // The admin who created the mission
            
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();
            
            // Prevent deleting a concern if it has an active mission tied to it
            $table->foreign('concern_id')->references('id')->on('concerns')->restrictOnDelete();
            
            // If personnel or verifiers are deleted from the system, just set their references to null
            $table->foreign('assigned_to')->references('id')->on('users')->nullOnDelete();
            $table->foreign('verified_by')->references('id')->on('users')->nullOnDelete();
            
            $table->foreign('playbook_id')->references('id')->on('category_playbooks')->restrictOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();

            // -- Indexes --
            // Enforce that one concern can only spawn one mission (for the MVP phase)
            $table->unique('concern_id', 'uk_mission_concern');
            
            // Helps the personnel portal load "My Missions" instantly
            $table->index(['assigned_to', 'status', 'due_date'], 'idx_missions_assignee');
            
            // Helps the admin dashboard Kanban board load instantly
            $table->index(['barangay_id', 'status', 'is_overdue', 'is_escalated'], 'idx_missions_board');
            
            // Helps the backend background job find missions that personnel haven't acknowledged yet
            $table->index(['status', 'acknowledged_at'], 'idx_missions_escalation');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('missions');
    }
};