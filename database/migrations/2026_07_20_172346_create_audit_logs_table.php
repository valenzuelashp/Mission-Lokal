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
    // Force MySQL to drop the table right before trying to create it
    Schema::dropIfExists('audit_logs');

    Schema::create('audit_logs', function (Blueprint $table) {
        $table->id();
        $table->char('barangay_id', 36)->nullable();
        $table->char('actor_id', 36)->nullable();
        $table->string('action', 64);
        $table->string('entity_type', 64);
        $table->char('entity_id', 36);
        $table->json('metadata')->nullable();
        $table->binary('ip_address', 16)->nullable();
        $table->timestamp('created_at', 3)->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
