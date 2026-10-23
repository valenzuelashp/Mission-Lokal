<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            $table->string('paper_size', 10)->default('short')->after('signatory_title');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->string('signature_path')->nullable()->after('contact_email');
        });
    }

    public function down(): void
    {
        Schema::table('document_templates', function (Blueprint $table) {
            $table->dropColumn('paper_size');
        });

        Schema::table('barangays', function (Blueprint $table) {
            $table->dropColumn('signature_path');
        });
    }
};
