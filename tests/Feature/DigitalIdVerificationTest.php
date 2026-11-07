<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class DigitalIdVerificationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_extension')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('verification_status');
            $table->string('digital_id_code')->unique()->nullable();
            $table->string('digital_id_verification_token', 64)->unique()->nullable();
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('resident_profiles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_qr_link_confirms_only_an_active_approved_resident(): void
    {
        $userId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'role' => UserRole::Resident->value,
            'first_name' => 'Maria',
            'middle_name' => 'Clara',
            'last_name' => 'Resident',
            'is_active' => true,
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $userId,
            'verification_status' => VerificationStatus::Approved->value,
            'digital_id_code' => 'TAMBO_RES_0001',
            'digital_id_verification_token' => 'unpredictable-private-token-for-test',
        ]);

        $this->get('/verify-id/unpredictable-private-token-for-test')
            ->assertOk()
            ->assertSee('Resident Verified')
            ->assertSee('Maria Clara Resident')
            ->assertDontSee('TAMBO_RES_0001')
            ->assertDontSee('unpredictable-private-token-for-test')
            ->assertDontSee('<script')
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow');
    }

    public function test_qr_link_does_not_confirm_unknown_or_unapproved_ids(): void
    {
        $this->get('/verify-id/unknown-private-token')
            ->assertOk()
            ->assertSee('Unable to Verify ID')
            ->assertDontSee('Maria Clara Resident')
            ->assertDontSee('unknown-private-token');
    }

    public function test_account_id_is_not_accepted_as_a_verification_token(): void
    {
        $userId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'role' => UserRole::Resident->value,
            'first_name' => 'Maria',
            'middle_name' => 'Clara',
            'last_name' => 'Resident',
            'is_active' => true,
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $userId,
            'verification_status' => VerificationStatus::Approved->value,
            'digital_id_code' => 'TAMBO_RES_0001',
            'digital_id_verification_token' => 'separate-random-verification-token',
        ]);

        $this->get('/verify-id/TAMBO_RES_0001')
            ->assertOk()
            ->assertSee('Unable to Verify ID')
            ->assertDontSee('Maria Clara Resident')
            ->assertDontSee('TAMBO_RES_0001');
    }

    public function test_unapproved_resident_name_is_not_disclosed(): void
    {
        $userId = (string) Str::uuid();
        DB::table('users')->insert([
            'id' => $userId,
            'role' => UserRole::Resident->value,
            'first_name' => 'Private',
            'middle_name' => null,
            'last_name' => 'Applicant',
            'is_active' => true,
        ]);
        DB::table('resident_profiles')->insert([
            'user_id' => $userId,
            'verification_status' => VerificationStatus::Pending->value,
            'digital_id_code' => 'PENDING_ID',
            'digital_id_verification_token' => 'pending-private-token',
        ]);

        $this->get('/verify-id/pending-private-token')
            ->assertOk()
            ->assertSee('Unable to Verify ID')
            ->assertDontSee('Private Applicant')
            ->assertDontSee('pending-private-token');
    }
}
