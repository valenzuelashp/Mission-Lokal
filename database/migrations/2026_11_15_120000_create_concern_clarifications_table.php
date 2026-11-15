<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_clarifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('concern_id')->constrained('concerns')->cascadeOnDelete();
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('questions');
            $table->text('response')->nullable();
            $table->timestamp('answered_at')->nullable();
            $table->timestamps();
            $table->index(['concern_id', 'answered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_clarifications');
    }
};
