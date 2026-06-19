<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blotter_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the parent blotter record
            $table->uuid('blotter_id');
            
            // File details
            $table->string('storage_key', 512);
            $table->string('mime_type', 64);
            
            // Only tracking when it was uploaded
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If the main blotter record is deleted, automatically delete these media records too
            $table->foreign('blotter_id')->references('id')->on('blotters')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blotter_media');
    }
};