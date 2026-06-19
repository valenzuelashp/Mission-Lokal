<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blotters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // Link to the tenant (barangay) and optionally to a concern if it originated from the app
            $table->uuid('barangay_id');
            $table->uuid('concern_id')->nullable();
            
            // Legal classification
            $table->enum('type', ['two_party', 'one_party']);
            $table->uuid('complainant_id');
            $table->string('respondent_name', 255)->nullable(); // Nullable because one-party blotters might not have a specific respondent
            
            // Incident Details
            $table->text('narrative');
            $table->dateTime('incident_at', 3)->nullable();
            $table->geometry('incident_location', 'point', 4326)->nullable();
            $table->string('incident_address', 512)->nullable();
            
            // Resolution tracking
            $table->text('relief_sought')->nullable();
            $table->json('witnesses')->nullable(); // JSON array of witness names/contacts
            $table->dateTime('signature_ack_at', 3)->nullable();
            
            // Official tracking
            $table->string('ticket_number', 32)->nullable();
            $table->enum('status', ['pending_approval', 'filed', 'mediated', 'resolved', 'archived', 'rejected'])->default('pending_approval');
            $table->dateTime('hearing_scheduled_at', 3)->nullable();
            
            // Admin approval
            $table->uuid('approved_by')->nullable();
            $table->dateTime('approved_at', 3)->nullable();
            
            $table->timestamps(3);

            // -- Relationships / Foreign Key Constraints --
            $table->foreign('barangay_id')->references('id')->on('barangays')->restrictOnDelete();
            $table->foreign('concern_id')->references('id')->on('concerns')->nullOnDelete();
            
            // Restrict on delete: Do not allow a user's account to be deleted if they have an active legal blotter record
            $table->foreign('complainant_id')->references('id')->on('users')->restrictOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();

            // -- Indexes --
            // Helps the admin dashboard quickly pull up blotters waiting for review/scheduling
            $table->index(['barangay_id', 'status', 'created_at'], 'idx_blotters_queue');
            
            // Helps load a specific resident's blotter history
            $table->index('complainant_id', 'idx_blotters_complainant');
            
            // Ensures a ticket number is strictly unique within a single barangay
            $table->unique(['barangay_id', 'ticket_number'], 'uk_blotter_ticket');
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blotters');
    }
};