<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 32)->unique();
            $table->string('name');
            $table->json('boundary')->nullable();
            $table->string('contact_phone', 20)->nullable();
            $table->string('contact_email')->nullable();
            $table->json('office_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps(3);
        });

        Schema::create('barangay_settings', function (Blueprint $table) {
            $table->uuid('barangay_id')->primary();
            $table->unsignedSmallInteger('ack_timeout_hours')->default(4);
            $table->unsignedSmallInteger('duplicate_geo_radius_m')->default(200);
            $table->unsignedSmallInteger('duplicate_time_window_h')->default(72);
            $table->unsignedSmallInteger('auto_sms_nearby_radius_m')->default(1500);
            $table->unsignedTinyInteger('max_personnel_sms_per_mission')->default(3);
            $table->unsignedSmallInteger('civic_xp_per_valid_report')->default(10);
            $table->unsignedSmallInteger('civic_xp_per_resolution')->default(5);
            $table->unsignedSmallInteger('civic_xp_per_upvote')->default(2);
            $table->unsignedSmallInteger('location_fuzz_meters')->default(50);
            $table->string('sms_sender_id', 20)->nullable();
            $table->timestamp('updated_at', 3);

            $table->foreign('barangay_id')->references('id')->on('barangays')->cascadeOnDelete();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('barangay_id')->nullable()->constrained('barangays')->nullOnDelete();
            $table->string('account_id', 64);
            $table->enum('role', ['resident', 'personnel', 'admin', 'super_admin']);
            $table->string('email')->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('password')->nullable();
            $table->enum('verification_status', ['pending', 'in_progress', 'approved', 'rejected'])->default('pending');
            $table->enum('profile_edit_status', ['none', 'pending_approval'])->default('none');
            $table->unsignedInteger('civic_xp')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_login_at', 3)->nullable();
            $table->rememberToken();
            $table->timestamps(3);

            $table->unique(['barangay_id', 'account_id']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        Schema::dropIfExists('barangay_settings');
        Schema::dropIfExists('barangays');
    }
};
