<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_proof', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            $table->uuid('mission_id');
            $table->uuid('submitted_by')->nullable(); // The personnel who submitted the proof            
            // Optional text context provided by the personnel
            $table->text('notes')->nullable();
            
            // The timestamp of the submission
            $table->dateTime('submitted_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If the mission is deleted, delete its proof submissions as well
            $table->foreign('mission_id')->references('id')->on('missions')->cascadeOnDelete();
            
            // If the personnel is deleted, keep the proof but remove the user link to preserve history
            $table->foreign('submitted_by')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Optimized for loading the newest proofs first when an admin views a mission
            $table->index(['mission_id', 'submitted_at'], 'idx_proof_mission');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_proof');
    }
};