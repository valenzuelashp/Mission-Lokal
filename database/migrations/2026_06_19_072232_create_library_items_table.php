<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the specific barangay
            $table->uuid('barangay_id');
            
            // Core details
            $table->enum('type', ['manual', 'contact', 'evacuation_center', 'emergency', 'faq']);
            $table->string('title', 255);
            $table->text('content')->nullable(); // Might be empty if it's just a map pin or contact number
            
            // Flexible metadata (e.g., phone numbers, operating hours)
            $table->json('metadata')->nullable();
            
            // Geographic coordinates (specifically for evacuation centers)
            $table->geometry('location', 'point', 4326)->nullable();
            
            // Display controls
            $table->smallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            
            // Standard timestamps
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();

            // -- Indexes --
            // This multi-column index helps the app rapidly pull and order active items by type for the resident library
            $table->index(['barangay_id', 'type', 'is_active', 'sort_order'], 'idx_library');
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_items');
    }
};