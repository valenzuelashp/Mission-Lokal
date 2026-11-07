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
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->string('digital_id_verification_token', 64)->nullable()->unique();
        });

        DB::table('resident_profiles')
            ->whereNull('digital_id_verification_token')
            ->orderBy('id')
            ->chunkById(100, function ($profiles): void {
                foreach ($profiles as $profile) {
                    DB::table('resident_profiles')
                        ->where('id', $profile->id)
                        ->update(['digital_id_verification_token' => Str::random(64)]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('resident_profiles', function (Blueprint $table) {
            $table->dropUnique(['digital_id_verification_token']);
            $table->dropColumn('digital_id_verification_token');
        });
    }
};
