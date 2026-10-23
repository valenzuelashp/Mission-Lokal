<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('key', 80);
            $table->string('name');
            $table->text('body');
            $table->string('signatory_name')->nullable();
            $table->string('signatory_title')->default('Punong Barangay');
            $table->json('resident_fields');
            $table->boolean('is_enabled')->default(true);
            $table->boolean('is_system')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps(3);

            $table->foreign('barangay_id')->references('id')->on('barangays')->cascadeOnDelete();
            $table->unique(['barangay_id', 'key'], 'document_templates_barangay_key_unique');
        });

        Schema::create('document_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->uuid('template_id');
            $table->uuid('user_id');
            $table->string('status', 20)->default('submitted');
            $table->json('answers');
            $table->text('review_note')->nullable();
            $table->uuid('reviewed_by')->nullable();
            $table->dateTime('reviewed_at', 3)->nullable();
            $table->timestamps(3);

            $table->foreign('barangay_id')->references('id')->on('barangays')->cascadeOnDelete();
            $table->foreign('template_id')->references('id')->on('document_templates')->restrictOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['barangay_id', 'status'], 'idx_document_requests_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_requests');
        Schema::dropIfExists('document_templates');
    }
};
