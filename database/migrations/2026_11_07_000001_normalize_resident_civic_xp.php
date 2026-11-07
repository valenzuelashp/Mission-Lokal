<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('resident_profiles')
            ->select(['id', 'user_id'])
            ->orderBy('id')
            ->chunkById(200, function ($profiles) {
                foreach ($profiles as $profile) {
                    $earnedXp = (int) DB::table('civic_xp_events')
                        ->where('user_id', $profile->user_id)
                        ->sum('points');

                    DB::table('resident_profiles')
                        ->where('id', $profile->id)
                        ->update(['civic_xp' => max(0, $earnedXp)]);
                }
            });

        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->unsignedInteger('civic_xp')->default(0)->change();
        });
    }

    public function down(): void
    {
        DB::table('resident_profiles')->increment('civic_xp', 50);

        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->unsignedInteger('civic_xp')->default(50)->change();
        });
    }
};