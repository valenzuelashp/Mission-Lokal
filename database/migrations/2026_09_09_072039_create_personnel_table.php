<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('personnel', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36)->unique();
            $table->geometry('registered_zone')->nullable();
            $table->geometry('last_known_location')->nullable();
            $table->datetime(3)->nullable()->name('location_updated_at');
            $table->tinyInteger('sms_enabled')->default(1);
            $table->tinyInteger('is_active')->default(1);
            $table->timestamps(3);

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('personnel');
    }
};