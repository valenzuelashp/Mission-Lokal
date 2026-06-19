<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_proof_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link back to the main proof submission
            $table->uuid('proof_id');
            
            // File details
            $table->string('storage_key', 512);
            $table->string('mime_type', 64);
            $table->string('caption', 255)->nullable();
            
            // Only tracking when it was uploaded, so no updated_at
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If the main proof record is deleted, automatically delete these image records too
            $table->foreign('proof_id')->references('id')->on('mission_proof')->cascadeOnDelete();

            // -- Indexes --
            $table->index('proof_id', 'idx_proof_media');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_proof_media');
    }
};