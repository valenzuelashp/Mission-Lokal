<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mission_proof', function (Blueprint $table) {
            $table->string('work_location')->nullable();
            $table->string('work_location_source')->nullable();
            $table->text('location_note')->nullable();
            $table->uuid('client_submission_id')->nullable()->unique();
        });
    }

    public function down(): void
    {
        Schema::table('mission_proof', function (Blueprint $table) {
            $table->dropUnique(['client_submission_id']);
            $table->dropColumn([
                'work_location',
                'work_location_source',
                'location_note',
                'client_submission_id',
            ]);
        });
    }
};
