<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_resolution_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('mission_id')->unique();
            $table->uuid('created_by')->nullable();
            $table->string('title');
            $table->text('body');
            $table->json('media_ids')->nullable();
            $table->boolean('is_published')->default(false);
            $table->dateTime('published_at', 3)->nullable();
            $table->timestamps(3);

            $table->foreign('mission_id')->references('id')->on('missions')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['is_published', 'published_at'], 'idx_mission_resolution_feed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_resolution_posts');
    }
};