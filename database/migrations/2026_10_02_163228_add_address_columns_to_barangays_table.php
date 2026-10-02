<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::table('barangays', function (Blueprint $table) {
        $table->string('house_street')->nullable()->after('name');
        $table->string('city')->nullable()->after('house_street');
        $table->string('province')->nullable()->after('city');
    });
}

public function down(): void
{
    Schema::table('barangays', function (Blueprint $table) {
        $table->dropColumn(['house_street', 'city', 'province']);
    });
}
};
