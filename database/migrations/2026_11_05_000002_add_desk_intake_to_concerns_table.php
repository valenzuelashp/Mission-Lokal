<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->dropForeign(['reporter_id']);
            $table->uuid('reporter_id')->nullable()->change();
            $table->foreign('reporter_id')->references('id')->on('users')->nullOnDelete();
            $table->uuid('intake_logged_by')->nullable()->after('reporter_id');
            $table->string('intake_channel', 24)->default('resident_portal')->after('intake_logged_by');
            $table->text('intake_reporter_name')->nullable()->after('intake_channel');
            $table->text('intake_reporter_phone')->nullable()->after('intake_reporter_name');
            $table->text('intake_reporter_address')->nullable()->after('intake_reporter_phone');
            $table->dateTime('incident_occurred_at')->nullable()->after('intake_reporter_address');
            $table->foreign('intake_logged_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['barangay_id', 'intake_channel', 'created_at'], 'idx_concerns_intake_source');
        });
    }

    public function down(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->dropForeign(['intake_logged_by']);
            $table->dropForeign(['reporter_id']);
            $table->dropIndex('idx_concerns_intake_source');
            $table->dropColumn([
                'intake_logged_by',
                'intake_channel',
                'intake_reporter_name',
                'intake_reporter_phone',
                'intake_reporter_address',
                'incident_occurred_at',
            ]);
            if (DB::table('concerns')->whereNull('reporter_id')->exists()) {
                throw new RuntimeException('Cannot roll back desk intake while accountless concerns exist.');
            }

            $table->uuid('reporter_id')->nullable(false)->change();
            $table->foreign('reporter_id')->references('id')->on('users')->restrictOnDelete();
        });
    }
};