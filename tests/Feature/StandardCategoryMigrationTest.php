<?php

namespace Tests\Feature;

use App\Enums\ConcernCategoryCode;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class StandardCategoryMigrationTest extends TestCase
{
    public function test_existing_concerns_and_subcategories_are_migrated_without_losing_history(): void
    {
        Schema::create('concern_categories', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->uuid('barangay_id')->nullable();
            $table->string('code');
            $table->string('name');
            $table->string('default_visibility')->default('public');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
        });
        Schema::create('concern_subcategories', function (Blueprint $table) {
            $table->smallIncrements('id');
            $table->unsignedSmallInteger('category_id');
            $table->string('code');
        });
        Schema::create('concerns', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedSmallInteger('category_id');
            $table->unsignedSmallInteger('subcategory_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('status')->default('active');
            $table->string('visibility')->default('public');
            $table->boolean('is_blotter_candidate')->default(false);
        });
        Schema::create('concern_ai_analysis', function (Blueprint $table) {
            $table->id();
            $table->unsignedSmallInteger('suggested_category_id')->nullable();
        });
        foreach (['INFRA', 'SANI', 'SEC', 'OTHER'] as $index => $code) {
            DB::table('concern_categories')->insert(['id' => $index + 1, 'code' => $code, 'name' => $code]);
        }
        DB::table('concern_subcategories')->insert([['id' => 4, 'category_id' => 1, 'code' => 'DRAINAGE'], ['id' => 6, 'category_id' => 3, 'code' => 'VAWC']]);
        DB::table('concerns')->insert([
            ['id' => 'drain', 'category_id' => 1, 'subcategory_id' => 4, 'title' => 'Clogged canal', 'description' => 'Water is pooling in the street.'],
            ['id' => 'sensitive', 'category_id' => 3, 'subcategory_id' => 6, 'title' => 'Confidential case', 'description' => 'Details supplied privately.'],
        ]);
        DB::table('concern_ai_analysis')->insert(['suggested_category_id' => 3]);

        (require database_path('migrations/2026_11_28_000001_standardize_concern_categories.php'))->up();

        $this->assertSame(9, DB::table('concern_categories')->where('is_active', true)->count());
        $this->assertSame(2, DB::table('concerns')->count());
        $drainage = DB::table('concern_categories')->where('code', 'DRAINAGE')->value('id');
        $vawc = DB::table('concern_categories')->where('code', 'VAWC')->value('id');
        $this->assertDatabaseHas('concerns', ['id' => 'drain', 'category_id' => $drainage, 'original_category_id' => 1, 'routed_department' => 'utility_infrastructure']);
        $this->assertDatabaseHas('concerns', ['id' => 'sensitive', 'category_id' => $vawc, 'visibility' => 'private', 'is_vawc' => 1]);
        $this->assertDatabaseHas('concern_subcategories', ['id' => 4, 'category_id' => $drainage]);
        $this->assertDatabaseHas('concern_ai_analysis', ['suggested_category_id' => 3]);
        foreach (ConcernCategoryCode::cases() as $category) {
            $this->assertDatabaseHas('concern_categories', ['code' => $category->value, 'name' => $category->label(), 'is_active' => 1]);
        }
        Schema::create('missions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('concern_id');
            $table->string('department');
            $table->string('status');
        });
        Schema::create('mission_personnel', function (Blueprint $table) {
            $table->id();
            $table->string('mission_id');
            $table->string('personnel_id');
        });
        DB::table('missions')->insert(['id' => 'legacy-drainage', 'concern_id' => 'drain', 'department' => 'Maintenance', 'status' => 'assigned']);
        DB::table('mission_personnel')->insert(['mission_id' => 'legacy-drainage', 'personnel_id' => 'original-assignee']);
        (require database_path('migrations/2026_11_28_000004_reconcile_active_mission_routes.php'))->up();
        $this->assertDatabaseHas('missions', ['id' => 'legacy-drainage', 'department' => 'Utility & Infrastructure']);
        $this->assertDatabaseHas('mission_personnel', ['mission_id' => 'legacy-drainage', 'personnel_id' => 'original-assignee']);
    }
}
