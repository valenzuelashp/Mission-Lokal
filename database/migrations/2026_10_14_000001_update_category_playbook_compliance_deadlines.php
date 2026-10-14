<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('category_playbooks')->where('subcategory_id', 1)->update(['default_due_days' => 3]);
        DB::table('category_playbooks')->where('subcategory_id', 2)->update(['default_due_days' => 3]);
        DB::table('category_playbooks')->where('subcategory_id', 3)->update(['default_due_days' => 3]);
        DB::table('category_playbooks')->where('subcategory_id', 4)->update(['default_due_days' => 7]);
    }

    public function down(): void
    {
        DB::table('category_playbooks')->where('subcategory_id', 2)->update(['default_due_days' => 1]);
        DB::table('category_playbooks')->where('subcategory_id', 3)->update(['default_due_days' => 1]);
        DB::table('category_playbooks')->where('subcategory_id', 4)->update(['default_due_days' => 2]);
    }
};