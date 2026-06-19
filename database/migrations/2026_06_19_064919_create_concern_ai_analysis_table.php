<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the parent concern
            $table->uuid('concern_id');
            
            // If the AI re-processes a concern, we can keep the old rows but mark them as is_current = false
            $table->boolean('is_current')->default(true);
            
            // AI Language and Categorization Predictions
            $table->enum('detected_language', ['en', 'fil', 'mixed'])->nullable();
            $table->unsignedSmallInteger('suggested_category_id')->nullable();
            $table->unsignedSmallInteger('suggested_subcategory_id')->nullable();
            $table->enum('suggested_visibility', ['public', 'private'])->nullable();
            $table->enum('suggested_severity', ['low', 'medium', 'high', 'critical'])->nullable();
            
            // Confidence score (0.000 to 1.000)
            $table->decimal('severity_confidence', 4, 3)->nullable();
            
            // JSON columns for flexible data structures
            $table->json('embedding')->nullable();
            $table->json('prescriptive_steps')->nullable();
            $table->json('raw_model_output')->nullable();
            
            // Suggested action timeline
            $table->date('suggested_due_date')->nullable();
            $table->unsignedSmallInteger('suggested_duration_hours')->nullable();
            
            // Duplicate detection
            $table->uuid('duplicate_candidate_id')->nullable();
            $table->decimal('duplicate_similarity', 5, 4)->nullable();
            
            // Explicit processing timestamp required by the schema
            $table->dateTime('processed_at', 3);
            
            // Laravel standard created/updated timestamps
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            // cascadeOnDelete() means if the parent concern is deleted, its AI analysis is automatically deleted too
            $table->foreign('concern_id')->references('id')->on('concerns')->cascadeOnDelete();
            
            $table->foreign('suggested_category_id')->references('id')->on('concern_categories')->restrictOnDelete();
            $table->foreign('suggested_subcategory_id')->references('id')->on('concern_subcategories')->restrictOnDelete();
            $table->foreign('duplicate_candidate_id')->references('id')->on('concerns')->nullOnDelete();

            // -- Indexes --
            $table->index(['concern_id', 'is_current'], 'idx_ai_concern');
            $table->index('duplicate_candidate_id', 'idx_ai_duplicate');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_ai_analysis');
    }
};