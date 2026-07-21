<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->enum('channel', ['in_app', 'push', 'email', 'sms']);
            $table->string('event_type');
            $table->string('title')->nullable();
            $table->text('body');
            $table->json('payload')->nullable();
            $table->boolean('is_read')->default(0);
            $table->datetime('sent_at')->nullable();
            $table->datetime('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'is_read']);
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};