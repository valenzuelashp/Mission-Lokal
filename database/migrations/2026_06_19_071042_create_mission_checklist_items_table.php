<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_checklist_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('mission_id');
            
            // The numerical order of the step (1, 2, 3...)
            $table->unsignedSmallInteger('step_order');
            
            // The actual instruction text
            $table->text('description');
            
            // Tracking completion
            $table->boolean('is_completed')->default(false);
            $table->dateTime('completed_at', 3)->nullable();
            
            // The personnel who ticked the box
            $table->uuid('completed_by')->nullable();

            // Note: The schema does not require created_at or updated_at for this table

            // -- Relationships / Foreign Key Constraints --
            // If the mission is deleted, delete its checklist items
            $table->foreign('mission_id')->references('id')->on('missions')->cascadeOnDelete();
            
            // If the user who completed the step is deleted, keep the checkmark but nullify the user reference
            $table->foreign('completed_by')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Mathematically prevent having two "Step 1"s for the same mission
            $table->unique(['mission_id', 'step_order'], 'uk_checklist_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_checklist_items');
    }
};
