<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // This forces the database to reject any value not in this list
        DB::statement('ALTER TABLE concerns ADD CONSTRAINT check_status_valid 
            CHECK (status IN ("submitted", "under_review", "in_progress", "resolved", "rejected", "merged", "ai_processed", "active", "spam"))');
    }

    public function down(): void
    {
        // This allows you to remove the rule if you ever need to change the status list
        DB::statement('ALTER TABLE concerns DROP CONSTRAINT check_status_valid');
    }
};