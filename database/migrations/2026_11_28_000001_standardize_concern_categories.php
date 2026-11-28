<?php

use App\Enums\ConcernCategoryCode;
use App\Models\Concern;
use App\Services\Concerns\ConcernClassification;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('concerns', function (Blueprint $table) {
            $table->unsignedSmallInteger('original_category_id')->nullable();
            $table->text('category_realignment_reason')->nullable();
            $table->string('routed_department', 64)->nullable()->index();
            $table->json('routed_roles')->nullable();
            $table->string('scope_status', 32)->default('pending');
            $table->text('scope_reason')->nullable();
            $table->boolean('is_vawc')->default(false);
            $table->unsignedInteger('content_revision')->default(1);
        });
        Schema::table('concern_ai_analysis', fn (Blueprint $table) => $table->unsignedInteger('content_revision')->default(1));

        // Preserve category IDs and all historic foreign keys, including tenant-specific catalogs.
        $legacy = DB::table('concern_categories')->get()->keyBy('id');
        DB::table('concern_categories')->update(['is_active' => false]);
        $ids = [];
        foreach (ConcernCategoryCode::cases() as $index => $definition) {
            $aliases = match ($definition) {
                ConcernCategoryCode::Waste => ['WASTE', 'SANI'], ConcernCategoryCode::Noise => ['NOISE', 'SEC'], default => [$definition->value]
            };
            $row = $legacy->first(fn ($row) => $row->barangay_id === null && in_array($row->code, $aliases, true));
            $data = ['barangay_id' => null, 'code' => $definition->value, 'name' => $definition->label(), 'default_visibility' => $definition === ConcernCategoryCode::Vawc ? 'private' : 'public', 'sort_order' => $index + 1, 'is_active' => true];
            if ($row) {
                DB::table('concern_categories')->where('id', $row->id)->update($data);
                $ids[$definition->value] = $row->id;
            } else {
                $ids[$definition->value] = DB::table('concern_categories')->insertGetId($data);
            }
        }
        $subcodes = ['ROAD_POTHOLE' => 'INFRA', 'STREET_LIGHT' => 'INFRA', 'GARBAGE' => 'WASTE', 'NOISE' => 'NOISE', 'DRAINAGE' => 'DRAINAGE', 'VAWC' => 'VAWC'];
        $subcategories = DB::table('concern_subcategories')->get()->keyBy('id');
        DB::table('concerns')->orderBy('id')->chunk(200, function ($concerns) use ($legacy, $ids, $subcategories, $subcodes) {
            foreach ($concerns as $concern) {
                $oldCode = $legacy->get($concern->category_id)?->code;
                $subcode = $subcategories->get($concern->subcategory_id)?->code;
                $definition = app(ConcernClassification::class)->category($concern->title, $concern->description);
                $code = $subcodes[$subcode] ?? $definition?->value ?? match ($oldCode) {
                    'SANI' => 'WASTE', 'SEC' => 'NOISE', default => isset($ids[$oldCode]) ? $oldCode : 'OTHER'
                };
                if (Concern::isVawcReport(null, $concern->title, $concern->description)) {
                    $code = 'VAWC';
                }
                $data = ['original_category_id' => $concern->category_id, 'category_id' => $ids[$code], ...ConcernCategoryCode::from($code)->routing()];
                $data['scope_status'] = app(ConcernClassification::class)->isActiveEmergency($concern->title.' '.$concern->description) ? 'out_of_scope' : (($definition || isset($subcodes[$subcode])) ? 'in_scope' : 'needs_review');
                if ($data['scope_status'] !== 'in_scope') {
                    $data['routed_department'] = null;
                    $data['routed_roles'] = [];
                }
                $data['routed_roles'] = json_encode($data['routed_roles']);
                if ($code === 'VAWC') {
                    $data += ['is_vawc' => true, 'visibility' => 'private', 'is_blotter_candidate' => true];
                }
                if ($code === 'OTHER' && $oldCode !== 'OTHER') {
                    $data['category_realignment_reason'] = 'Legacy category needs admin triage; original category retained in history.';
                }
                DB::table('concerns')->where('id', $concern->id)->update($data);
            }
        });
        foreach ($subcategories as $sub) {
            $code = $subcodes[$sub->code] ?? match ($legacy->get($sub->category_id)?->code) {
                'SANI' => 'WASTE', 'SEC' => 'NOISE', 'INFRA' => 'INFRA', default => 'OTHER'
            };
            $duplicate = DB::table('concern_subcategories')->where('category_id', $ids[$code])->where('code', $sub->code)->where('id', '!=', $sub->id)->exists();
            if (! $duplicate) {
                DB::table('concern_subcategories')->where('id', $sub->id)->update(['category_id' => $ids[$code]]);
            }
        }
        if (Schema::hasColumn('concern_subcategories', 'force_private')) {
            DB::table('concern_subcategories')->where('code', 'NOISE')->update(['force_private' => false]);
        }
        // Existing missions keep their assignees and history; staff can review changed routes.
    }

    public function down(): void
    {
        // Category changes preserve history and are intentionally not reversed destructively.
        Schema::table('concern_ai_analysis', fn (Blueprint $table) => $table->dropColumn('content_revision'));
        Schema::table('concerns', fn (Blueprint $table) => $table->dropColumn(['original_category_id', 'category_realignment_reason', 'routed_department', 'routed_roles', 'scope_status', 'scope_reason', 'is_vawc', 'content_revision']));
    }
};
