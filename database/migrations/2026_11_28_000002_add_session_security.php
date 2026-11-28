<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('active_session_token', 64)->nullable();
            $table->string('session_pin_hash')->nullable();
            $table->timestamp('session_locked_at')->nullable();
        });
        // Require old sessions to authenticate again before entering the protected portal.
        DB::table('users')->orderBy('id')->chunk(200, function ($users) {
            foreach ($users as $user) {
                DB::table('users')->where('id', $user->id)->update(['active_session_token' => Str::random(64), 'remember_token' => null]);
            }
        });
        Schema::create('login_activities', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable()->index();
            $table->uuid('barangay_id')->nullable()->index();
            $table->string('account_id', 128);
            $table->string('user_name');
            $table->string('role', 32)->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('browser', 64)->nullable();
            $table->string('device', 64)->nullable();
            $table->string('approximate_location')->default('Unknown');
            $table->timestamp('signed_in_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_activities');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['active_session_token', 'session_pin_hash', 'session_locked_at']));
    }
};
