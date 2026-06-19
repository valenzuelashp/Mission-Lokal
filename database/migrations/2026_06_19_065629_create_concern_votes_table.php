<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('concern_votes', function (Blueprint $table) {
            $table->uuid('concern_id');
            $table->uuid('user_id');
            
            // tinyInteger is perfect for small numbers like 1 (upvote) and -1 (downvote)
            $table->tinyInteger('vote');
            
            // Standard created_at and updated_at
            $table->timestamps(3);

            // -- Primary Key --
            // By combining these two columns into a "Composite Primary Key", 
            // the database mathematically guarantees that one user cannot vote on the same concern twice.
            $table->primary(['concern_id', 'user_id']);

            // -- Relationships / Foreign Key Constraints --
            // If the user or the concern is deleted, their votes should disappear too
            $table->foreign('concern_id')->references('id')->on('concerns')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            // -- Indexes --
            // Helps quickly pull up all votes cast by a specific user
            $table->index('user_id', 'idx_votes_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('concern_votes');
    }
};