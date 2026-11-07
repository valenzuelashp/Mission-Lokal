<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const BADGES = [
        ['key' => 'civic-spark', 'name' => 'Civic Spark', 'threshold' => 60],
        ['key' => 'community-helper', 'name' => 'Community Helper', 'threshold' => 70],
        ['key' => 'neighborhood-champion', 'name' => 'Neighborhood Champion', 'threshold' => 80],
        ['key' => 'civic-advocate', 'name' => 'Civic Advocate', 'threshold' => 90],
        ['key' => 'civic-leader', 'name' => 'Civic Leader', 'threshold' => 100],
    ];

    public function up(): void
    {
        Schema::create('resident_badges', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('badge_key', 48);
            $table->string('name', 100);
            $table->unsignedSmallInteger('threshold');
            $table->unsignedSmallInteger('earned_xp');
            $table->timestamp('earned_at');
            $table->unique(['user_id', 'badge_key']);
            $table->index(['user_id', 'threshold']);
        });

        $monthStart = now()->startOfMonth();
        DB::table('resident_profiles')
            ->select(['id', 'user_id'])
            ->orderBy('id')
            ->chunkById(200, function ($profiles) use ($monthStart) {
                foreach ($profiles as $profile) {
                    $monthlyPoints = (int) DB::table('civic_xp_events')
                        ->where('user_id', $profile->user_id)
                        ->where('created_at', '>=', $monthStart)
                        ->sum('points');
                    $monthlyXp = min(100, max(0, 50 + $monthlyPoints));

                    DB::table('resident_profiles')
                        ->where('id', $profile->id)
                        ->update(['civic_xp' => $monthlyXp]);

                    foreach (self::BADGES as $badge) {
                        if ($monthlyXp >= $badge['threshold']) {
                            DB::table('resident_badges')->insertOrIgnore([
                                'id' => (string) Str::uuid(),
                                'user_id' => $profile->user_id,
                                'badge_key' => $badge['key'],
                                'name' => $badge['name'],
                                'threshold' => $badge['threshold'],
                                'earned_xp' => $monthlyXp,
                                'earned_at' => now(),
                            ]);
                        }
                    }
                }
            });

        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->unsignedInteger('civic_xp')->default(50)->change();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resident_badges');

        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->unsignedInteger('civic_xp')->default(0)->change();
        });
    }
};