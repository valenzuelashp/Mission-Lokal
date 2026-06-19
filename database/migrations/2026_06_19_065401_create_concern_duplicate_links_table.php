<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_duplicate_links', function (Blueprint $table) {
            $table->uuid('id')->primary();
            
            // The two concerns being linked
            $table->uuid('primary_concern_id');
            $table->uuid('linked_concern_id');
            
            // The type of relationship between them
            $table->enum('link_type', ['merge', 'link', 'dismissed']);
            
            // The staff member who performed the action
            $table->uuid('created_by');
            
            // Note: This table only has created_at, not updated_at
            $table->dateTime('created_at', 3);

            // -- Relationships / Foreign Key Constraints --
            // If either concern is deleted, this link should automatically be removed
            $table->foreign('primary_concern_id')->references('id')->on('concerns')->cascadeOnDelete();
            $table->foreign('linked_concern_id')->references('id')->on('concerns')->cascadeOnDelete();
            
            // Prevent deleting a user if they have created duplicate links
            $table->foreign('created_by')->references('id')->on('users')->restrictOnDelete();

            // -- Indexes --
            // A unique constraint to ensure the same two concerns aren't linked multiple times
            $table->unique(['primary_concern_id', 'linked_concern_id'], 'uk_duplicate_pair');
            $table->index('linked_concern_id', 'idx_duplicate_linked');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_duplicate_links');
    }
};