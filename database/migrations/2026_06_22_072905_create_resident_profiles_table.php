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
        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->id();
            // Since your User model uses UUIDs, we use foreignUuid here
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            
            // Store the ID picture path
            $table->string('government_id_storage_key')->nullable();
            
            // Store the admin's reason if they reject the ID
            $table->text('rejection_reason')->nullable();
            
            // Store their unique digital ID number for later
            $table->string('digital_id_code')->unique()->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resident_profiles');
    }
};
