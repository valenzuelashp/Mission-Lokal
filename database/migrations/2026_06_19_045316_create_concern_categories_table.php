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
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->smallIncrements('id'); // Primary Key (Small Integer)
            $table->char('barangay_id', 36)->nullable(); // Nullable because some categories are global templates
            $table->string('code', 64);
            $table->string('name', 128);
            $table->enum('default_visibility', ['public', 'private']);
            $table->smallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            // Foreign Key and Unique Constraints
            $table->foreign('barangay_id')->references('id')->on('barangays')->onDelete('restrict');
            $table->unique(['barangay_id', 'code'], 'uk_category_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_categories');
    }
};
