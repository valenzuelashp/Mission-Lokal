<?php

use Illuminate\Database\Migrations\Migration;
use App\Support\MapHelpers;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $axisOrder = MapHelpers::usesMariaDb() ? '' : ", 'axis-order=long-lat'";

        DB::statement("
            UPDATE concerns 
            SET location = ST_GeomFromText(CONCAT('POINT(', ST_Y(location), ' ', ST_X(location), ')'), 4326{$axisOrder})
            WHERE ST_X(location) < 90 AND ST_Y(location) > 90
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $axisOrder = MapHelpers::usesMariaDb() ? '' : ", 'axis-order=long-lat'";

        DB::statement("
            UPDATE concerns 
            SET location = ST_GeomFromText(CONCAT('POINT(', ST_Y(location), ' ', ST_X(location), ')'), 4326{$axisOrder})
            WHERE ST_X(location) > 90 AND ST_Y(location) < 90
        ");
    }
};