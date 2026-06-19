<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concerns', function (Blueprint $table) {
            // Primary key as a UUID (CHAR 36)
            $table->uuid('id')->primary();
            
            // Foreign Keys linking to other tables
            $table->uuid('barangay_id');
            $table->uuid('reporter_id');
            
            // Core Concern Data
            $table->string('title', 255);
            $table->text('description');
            
            // Unsigned Small Integers match the DB schema for categories
            $table->unsignedSmallInteger('category_id')->nullable();
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            
            // State and Classification
            $table->enum('visibility', ['public', 'private']);
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->nullable();
            $table->boolean('severity_confirmed')->default(false);
            $table->enum('status', ['submitted', 'ai_processed', 'under_review', 'rejected', 'spam', 'active', 'resolved', 'closed'])->default('submitted');
            
            // Geospatial Data (SRID 4326 is the standard GPS coordinate system)
            $table->geometry('location', 'point', 4326);
            $table->geometry('public_location', 'point', 4326)->nullable();
            $table->string('address_text', 512)->nullable();
            
            // Flags and Meta
            $table->boolean('is_blotter_candidate')->default(false);
            $table->uuid('duplicate_of_id')->nullable();
            
            // Audit Timestamps and Actors
            $table->dateTime('ai_processed_at', 3)->nullable();
            $table->uuid('staff_reviewed_by')->nullable();
            $table->dateTime('staff_reviewed_at', 3)->nullable();
            $table->text('closed_summary')->nullable();
            
            // Standard created_at and updated_at with milliseconds precision
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            // restrictOnDelete() prevents a user/category from being deleted if a concern relies on it
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();
            $table->foreign('reporter_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('category_id')->references('id')->on('concern_categories')->restrictOnDelete();
            $table->foreign('subcategory_id')->references('id')->on('concern_subcategories')->restrictOnDelete();
            $table->foreign('staff_reviewed_by')->references('id')->on('users')->restrictOnDelete();
            // nullOnDelete() means if the "master" duplicate concern is deleted, this one just unlinks rather than deleting
            $table->foreign('duplicate_of_id')->references('id')->on('concerns')->nullOnDelete();

            // -- Indexes for fast querying --
            $table->index(['barangay_id', 'visibility', 'status', 'created_at'], 'idx_concerns_feed');
            $table->index(['reporter_id', 'created_at'], 'idx_concerns_reporter');
            $table->index(['barangay_id', 'status', 'ai_processed_at'], 'idx_concerns_queue');
            $table->spatialIndex('location', 'spx_concerns_location');
            $table->fullText(['title', 'description'], 'ftx_concerns_search');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concerns');
    }
};