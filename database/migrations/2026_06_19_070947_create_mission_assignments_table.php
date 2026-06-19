<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_assignments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('mission_id');
            $table->uuid('personnel_id')->nullable();
            $table->uuid('assigned_by')->nullable(); // The admin who made the assignment
            
            // Timestamps specific to the assignment lifecycle
            $table->dateTime('assigned_at', 3);
            $table->dateTime('unassigned_at', 3)->nullable();
            $table->dateTime('sms_sent_at', 3)->nullable();

            // -- Relationships / Foreign Key Constraints --
            // If the mission is deleted, delete its assignment history too
            $table->foreign('mission_id')->references('id')->on('missions')->cascadeOnDelete();
            
            // If users are deleted, keep the history but null out their IDs
            $table->foreign('personnel_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('assigned_by')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Helps quickly find who currently holds a mission (where unassigned_at is null)
            $table->index(['mission_id', 'unassigned_at'], 'idx_mission_assign_active');
            
            // Helps quickly pull a history of all assignments for a specific personnel member
            $table->index(['personnel_id', 'assigned_at'], 'idx_mission_assign_personnel');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_assignments');
    }
};