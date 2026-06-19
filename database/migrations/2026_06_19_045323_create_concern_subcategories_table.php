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
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('category_id'); // Links to the parent category
            $table->string('code', 64);
            $table->string('name', 128);
            $table->boolean('force_private')->default(false);
            $table->boolean('is_active')->default(true);

            // Foreign Key and Unique Constraints
            $table->foreign('category_id')->references('id')->on('concern_categories')->onDelete('restrict');
            $table->unique(['category_id', 'code'], 'uk_subcategory');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_subcategories');
    }
};
