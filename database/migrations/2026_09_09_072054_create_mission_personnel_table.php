<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('mission_id', 36);
            $table->char('personnel_id', 36);
            $table->char('assigned_by', 36);
            
            $table->enum('status', ['assigned', 'acknowledged', 'in_progress', 'completed'])->default('assigned');
            $table->datetime(3)->nullable()->name('acknowledged_at');
            $table->datetime(3)->nullable()->name('completed_at');
            $table->datetime(3)->nullable()->name('sms_sent_at');
            $table->timestamps(3);

            $table->unique(['mission_id', 'personnel_id'], 'uk_mission_personnel');
            
            // Explicit foreign keys matching exact char(36) definitions
            $table->foreign('mission_id')->references('id')->on('missions')->onDelete('cascade');
            $table->foreign('personnel_id')->references('id')->on('personnel')->onDelete('cascade');
            $table->foreign('assigned_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mission_personnel');
    }
};