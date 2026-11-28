<?php

namespace Tests\Support;

use Illuminate\Database\Schema\Blueprint;

/** Shared additive schema for tests that intentionally create small domain fixtures. */
class ConcernSchema
{
    public static function classification(Blueprint $table, bool $closedSummary = false): void
    {
        $table->unsignedSmallInteger('original_category_id')->nullable();
        $table->text('category_realignment_reason')->nullable();
        $table->string('routed_department')->nullable();
        $table->json('routed_roles')->nullable();
        $table->string('scope_status')->default('in_scope');
        $table->text('scope_reason')->nullable();
        $table->boolean('is_vawc')->default(false);
        $table->unsignedInteger('content_revision')->default(1);
        if ($closedSummary) {
            $table->text('closed_summary')->nullable();
        }
    }
}
