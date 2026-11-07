<?php

namespace Tests\Feature;

use App\Enums\AdminType;
use App\Enums\UserRole;
use App\Http\Middleware\HandleInertiaRequests;
use App\Mail\PrimaryAdminCredentials;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class BarangayAdminProvisioningTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('house_street')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('contact_email')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('account_id');
            $table->string('role');
            $table->string('admin_type')->nullable();
            $table->boolean('is_view_only')->default(false);
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable()->unique();
            $table->string('password')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(false);
            $table->timestamps();
            $table->unique(['barangay_id', 'account_id']);
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('barangays');

        parent::tearDown();
    }

    public function test_new_barangay_setup_provisions_two_full_access_admin_seats(): void
    {
        Mail::fake();
        $superAdmin = User::create([
            'id' => (string) Str::uuid(),
            'account_id' => 'SA-001',
            'role' => UserRole::SuperAdmin,
            'first_name' => 'Platform',
            'last_name' => 'Admin',
            'email' => 'platform@example.test',
            'password' => 'test-password',
            'is_active' => true,
        ]);

        $this->withoutMiddleware([HandleInertiaRequests::class]);
        $this->actingAs($superAdmin)->post('/super-admin/barangays', [
            'barangay_name' => 'Barangay Example',
            'house_street' => 'Barangay Hall',
            'city' => 'Sample City',
            'province' => 'Sample Province',
            'contact_phone' => '09170000000',
            'contact_email' => 'office@example.test',
            'admin_first_name' => 'General',
            'admin_last_name' => 'Admin',
            'admin_email' => 'general@example.test',
            'radio_room_admin_first_name' => 'Radio',
            'radio_room_admin_last_name' => 'Admin',
            'radio_room_admin_email' => 'radio@example.test',
        ])->assertSessionHas('success');

        $admins = User::query()->where('role', UserRole::Admin)->get();
        $this->assertCount(2, $admins);
        $this->assertSame(
            [AdminType::General->value, AdminType::RadioRoom->value],
            $admins->map(fn (User $admin) => $admin->admin_type->value)->sort()->values()->all(),
        );
        $this->assertSame(2, $admins->filter(fn (User $admin) => ! $admin->is_view_only && $admin->canModifySystem())->count());
        $this->assertSame(2, $admins->pluck('account_id')->unique()->count());
        Mail::assertSent(PrimaryAdminCredentials::class, 2);
    }
}