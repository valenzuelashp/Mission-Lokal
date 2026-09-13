<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (! Schema::hasColumn('announcements', 'event_at')) {
                $table->dateTime('event_at', 3)->nullable()->after('published_at');
                $table->index(['barangay_id', 'event_at'], 'idx_announcements_event_at');
            }
        });

        if (Schema::hasColumn('announcements', 'event_at') && Schema::hasColumn('announcements', 'kind')) {
            DB::table('announcements')
                ->whereIn('kind', ['event', 'volunteer'])
                ->whereNull('event_at')
                ->whereNotNull('published_at')
                ->update(['event_at' => DB::raw('published_at')]);
        }
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            if (Schema::hasColumn('announcements', 'event_at')) {
                $table->dropIndex('idx_announcements_event_at');
                $table->dropColumn('event_at');
            }
        });
    }
};
