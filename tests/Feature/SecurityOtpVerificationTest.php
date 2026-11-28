<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\EnsureResidentIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class SecurityOtpVerificationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table): void {
            $table->char('id', 36)->primary();
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->string('purpose', 32)->default('password_reset');
            $table->char('otp_hash', 64);
            $table->dateTime('expires_at', 3);
            $table->dateTime('used_at', 3)->nullable();
            $table->dateTime('created_at', 3)->nullable();
        });

        $this->withoutMiddleware([
            EnsureBarangayIsActive::class,
            EnsureResidentIsVerified::class,
            HandleInertiaRequests::class,
        ]);
    }

    public function test_a_verified_otp_cannot_be_reused(): void
    {
        $user = new User;
        $user->id = (string) Str::uuid();
        $user->role = 'resident';
        $otp = '123456';

        DB::table('password_reset_tokens')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'purpose' => 'security_change',
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(15),
            'used_at' => null,
            'created_at' => now(),
        ]);

        $this->actingAs($user)
            ->post(route('profile.security.verify'), ['otp' => $otp])
            ->assertRedirect(route('profile.security'));

        $this->actingAs($user)
            ->post(route('profile.security.verify'), ['otp' => $otp])
            ->assertSessionHasErrors('otp');

        $this->assertNotNull(
            DB::table('password_reset_tokens')->where('user_id', $user->id)->value('used_at')
        );
    }

    public function test_existing_otp_rows_default_to_the_password_reset_purpose(): void
    {
        Schema::drop('password_reset_tokens');
        Schema::create('password_reset_tokens', function (Blueprint $table): void {
            $table->char('id', 36)->primary();
            $table->char('user_id', 36);
            $table->char('otp_hash', 64);
            $table->dateTime('expires_at', 3);
            $table->dateTime('used_at', 3)->nullable();
            $table->dateTime('created_at', 3)->nullable();
        });

        $migration = require base_path('database/migrations/2026_11_26_000002_add_purpose_to_password_reset_tokens.php');
        $migration->up();

        $this->assertTrue(Schema::hasColumn('password_reset_tokens', 'purpose'));

        DB::table('password_reset_tokens')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => (string) Str::uuid(),
            'otp_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(15),
            'created_at' => now(),
        ]);

        $this->assertSame(
            'password_reset',
            DB::table('password_reset_tokens')->value('purpose')
        );
    }

    public function test_opening_the_security_request_page_does_not_send_an_otp(): void
    {
        $user = $this->createUser();
        $user->role = 'resident';
        Mail::fake();

        $this->actingAs($user)
            ->get(route('profile.security.request.form'))
            ->assertOk();

        Mail::assertNothingSent();

        $this->actingAs($user)
            ->post(route('profile.security.request'))
            ->assertRedirect(route('profile.security.verify.form'));

        Mail::assertSent(OtpMail::class, fn (OtpMail $mail): bool => $mail->hasTo($user->email));
        $this->assertDatabaseHas('password_reset_tokens', [
            'user_id' => $user->id,
            'purpose' => 'security_change',
        ]);
    }

    public function test_a_security_otp_cannot_be_used_to_reset_a_password(): void
    {
        $user = $this->createUser();
        $this->createOtp($user, '123456', 'security_change');

        $this->post(route('password.update'), [
            'email' => $user->email,
            'otp' => '123456',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])->assertSessionHasErrors('otp');

        $this->assertTrue(Hash::check('CurrentPassword123!', $user->fresh()->password));
    }

    public function test_password_reset_otp_is_consumed_only_when_the_password_changes(): void
    {
        $user = $this->createUser();
        $this->createOtp($user, '654321', 'password_reset');

        $this->post(route('password.verify'), [
            'email' => $user->email,
            'otp' => '654321',
        ])->assertSessionHas('success');

        $this->assertNull(
            DB::table('password_reset_tokens')->where('user_id', $user->id)->value('used_at')
        );

        $payload = [
            'email' => $user->email,
            'otp' => '654321',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ];

        $this->post(route('password.update'), $payload)->assertRedirect(route('login'));
        $this->assertTrue(Hash::check('NewPassword123!', $user->fresh()->password));

        $this->post(route('password.update'), $payload)->assertSessionHasErrors('otp');
    }

    private function createUser(): User
    {
        $user = new User;
        $user->email = 'resident@example.test';
        $user->password = 'CurrentPassword123!';
        $user->save();

        return $user;
    }

    private function createOtp(User $user, string $otp, string $purpose): void
    {
        DB::table('password_reset_tokens')->insert([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'purpose' => $purpose,
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(15),
            'used_at' => null,
            'created_at' => now(),
        ]);
    }
}
