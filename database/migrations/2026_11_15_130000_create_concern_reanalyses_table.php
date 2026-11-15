<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_reanalyses', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('concern_id')->constrained('concerns')->cascadeOnDelete();
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('analysis_id')->nullable()->constrained('concern_ai_analysis')->nullOnDelete();
            $table->json('clarification_ids');
            $table->string('status', 20)->default('queued');
            $table->string('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['concern_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_reanalyses');
    }
};
