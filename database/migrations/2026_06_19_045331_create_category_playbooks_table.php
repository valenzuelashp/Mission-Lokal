<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('category_playbooks', function (Blueprint $table) {
            $table->uuid('id')->primary(); // CHAR(36) UUID for primary key
            $table->unsignedSmallInteger('subcategory_id'); // Links to the subcategory
            $table->string('title', 255);
            $table->json('steps_template')->nullable(); // Stores the checklist for personnel
            $table->unsignedSmallInteger('default_duration_hours')->nullable();
            $table->unsignedTinyInteger('default_due_days')->nullable();
            $table->boolean('is_active')->default(true);

            // Foreign Key and Index Constraints
            $table->foreign('subcategory_id')->references('id')->on('concern_subcategories')->onDelete('restrict');
            $table->index('subcategory_id', 'idx_playbook_subcategory');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_playbooks');
    }
};
