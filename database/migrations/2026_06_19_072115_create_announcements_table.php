<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the specific barangay
            $table->uuid('barangay_id');
            
            // Content
            $table->string('title', 255);
            $table->text('body');
            
            // Publishing controls
            $table->boolean('is_published')->default(false);
            $table->dateTime('published_at', 3)->nullable();
            
            // The admin who created it
            $table->uuid('created_by')->nullable();
            
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();
            
            // If the admin who wrote the announcement is deleted, we keep the announcement but null out the author
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // This index is crucial for the resident newsfeed so it can quickly grab only published announcements, sorted by date
            $table->index(['barangay_id', 'is_published', 'published_at'], 'idx_announcements_feed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};