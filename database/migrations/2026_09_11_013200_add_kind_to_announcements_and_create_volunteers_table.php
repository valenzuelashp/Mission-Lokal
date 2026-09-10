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
            $table->string('kind', 32)->default('advisory')->after('body');
        });

        DB::table('announcements')->where('title', 'Barangay Fiesta 2026')->update(['kind' => 'event']);
        DB::table('announcements')->where('title', 'Relief Goods Distribution')->update(['kind' => 'volunteer']);

        Schema::create('announcement_volunteers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('announcement_id');
            $table->uuid('user_id');
            $table->timestamps(3);

            $table->unique(['announcement_id', 'user_id']);
            $table->foreign('announcement_id')->references('id')->on('announcements')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_volunteers');

        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn('kind');
        });
    }
};
