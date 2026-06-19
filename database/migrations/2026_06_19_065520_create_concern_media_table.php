<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the parent concern
            $table->uuid('concern_id');
            
            // Where the file is actually stored (e.g., "concerns/images/report123.jpg")
            $table->string('storage_key', 512);
            
            // The type of file (e.g., "image/jpeg", "application/pdf")
            $table->string('mime_type', 64);
            
            // Used if the resident uploads multiple photos and we want to keep them in a specific order
            $table->unsignedTinyInteger('sort_order')->default(0);
            
            // This table only tracks when the media was uploaded, so no updated_at
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If the parent concern is deleted, automatically delete these media records too
            $table->foreign('concern_id')->references('id')->on('concerns')->cascadeOnDelete();

            // -- Indexes --
            // Optimized for loading a concern's images in the correct order
            $table->index(['concern_id', 'sort_order'], 'idx_concern_media');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_media');
    }
};