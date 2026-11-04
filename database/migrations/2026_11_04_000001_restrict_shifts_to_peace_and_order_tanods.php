<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('personnel')
            ->where(function ($query) {
                $query->whereNull('role')
                    ->orWhere('role', '!=', 'tanod')
                    ->orWhereNull('department')
                    ->orWhereNotIn('department', ['peace_order', 'Peace & Order']);
            })
            ->update(['shift' => null]);
    }

    public function down(): void
    {
        // Previously assigned shifts for other roles cannot be safely reconstructed.
    }
};
