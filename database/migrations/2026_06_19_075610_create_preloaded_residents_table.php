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
        Schema::create('preloaded_residents', function (Blueprint $table) {
            $table->id();
            $table->string('account_id')->unique();
            
            // Replaced full_name with the 4 specific name columns
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_extension')->nullable();
            
            $table->date('birthday');
            $table->text('address')->nullable();
            $table->string('email')->nullable();
            $table->string('mobile')->nullable();
            
            // These help us track if a resident has already registered/claimed their account
            $table->boolean('is_claimed')->default(false);
            $table->timestamp('claimed_at')->nullable();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preloaded_residents');
    }
};