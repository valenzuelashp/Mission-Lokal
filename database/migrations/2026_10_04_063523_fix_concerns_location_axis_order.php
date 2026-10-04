<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("
            UPDATE concerns 
            SET location = PointFromText(CONCAT('POINT(', ST_Y(location), ' ', ST_X(location), ')'), 4326)
            WHERE ST_X(location) < 90 AND ST_Y(location) > 90
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back if rolled back
        DB::statement("
            UPDATE concerns 
            SET location = PointFromText(CONCAT('POINT(', ST_Y(location), ' ', ST_X(location), ')'), 4326)
            WHERE ST_X(location) > 90 AND ST_Y(location) < 90
        ");
    }
};