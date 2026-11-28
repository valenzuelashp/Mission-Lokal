<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\EnsureResidentIsVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Jobs\LocateLoginActivity;
use App\Models\LoginActivity;
use App\Models\User;
use App\Services\SessionSecurity;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Session\ArraySessionHandler;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class SessionSecurityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Queue::fake();
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('account_id');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('role');
            $table->string('password');
            $table->rememberToken();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });
        (require database_path('migrations/2026_11_28_000002_add_session_security.php'))->up();
        (require database_path('migrations/2026_11_28_000003_add_session_lock_version.php'))->up();
        (require database_path('migrations/2026_11_28_000005_add_session_away_timer.php'))->up();
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class, EnsureResidentIsVerified::class]);
        Route::middleware(['web', 'auth'])->get('/_security/protected', fn () => response()->json(['secret' => 'protected data']));
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('login_activities');
        Schema::dropIfExists('users');
        parent::tearDown();
    }

    private function user(string $role = 'admin'): User
    {
        $user = User::create(['barangay_id' => 'barangay-a', 'account_id' => 'SEC'.Str::random(8), 'first_name' => 'Test', 'last_name' => 'Account', 'role' => $role, 'password' => 'StrongPassword!123']);
        $user->forceFill(['session_pin_hash' => Hash::make('123456'), 'active_session_token' => Str::random(64)])->save();

        return $user;
    }

    private function loginRequest(): Request
    {
        $request = Request::create('/login', 'POST', [], [], [], ['REMOTE_ADDR' => '203.0.113.9', 'HTTP_USER_AGENT' => 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36']);
        $store = new Store('test-'.Str::random(8), new ArraySessionHandler(120));
        $store->start();
        $request->setLaravelSession($store);

        return $request;
    }

    private function recordLogin(User $user, array $overrides = []): LoginActivity
    {
        return LoginActivity::create(array_replace([
            'user_id' => $user->id, 'barangay_id' => $user->barangay_id,
            'account_id' => $user->account_id, 'user_name' => $user->first_name.' '.$user->last_name,
            'role' => $user->role->value, 'signed_in_at' => now(),
            'ip_address' => '203.0.113.10', 'browser' => 'Chrome', 'device' => 'Android',
            'approximate_location' => 'Paranaque, Metro Manila, Philippines',
        ], $overrides));
    }

    public function test_new_login_revokes_prior_generation_and_rotates_remember_token_for_each_role(): void
    {
        foreach (['admin', 'personnel', 'resident'] as $role) {
            $user = $this->user($role);
            $first = $this->loginRequest();
            $second = $this->loginRequest();
            app(SessionSecurity::class)->activate($first, $user);
            $remember = $user->remember_token;
            app(SessionSecurity::class)->activate($second, $user);
            $this->assertFalse(app(SessionSecurity::class)->matches($first, $user->fresh()));
            $this->assertTrue(app(SessionSecurity::class)->matches($second, $user->fresh()));
            $this->assertNotSame($remember, $user->fresh()->remember_token);
        }
        $this->assertSame(6, LoginActivity::count());
        $this->assertDatabaseHas('login_activities', ['ip_address' => '203.0.113.9', 'browser' => 'Chrome', 'device' => 'Windows', 'approximate_location' => 'Unknown']);
        Queue::assertPushed(LocateLoginActivity::class, 6);
    }

    public function test_revoked_sessions_cannot_read_protected_data_or_unlock(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => 'revoked'])->getJson('/_security/protected')->assertStatus(401)->assertJsonPath('code', 'session_revoked')->assertDontSee('protected data');
        $this->actingAs($user->fresh())->withSession(['active_session_token' => 'revoked'])->postJson('/session/unlock', ['pin' => '123456'])->assertStatus(401);
    }

    public function test_expired_sessions_return_json_401_for_status_and_event_streams(): void
    {
        $this->getJson('/session/status')->assertStatus(401)->assertJsonPath('code', 'session_expired');
        $this->get('/session/events')->assertStatus(401)->assertJsonPath('code', 'session_expired');
    }

    public function test_locked_session_remains_authenticated_but_requires_server_verified_pin(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token])->postJson('/session/lock')->assertOk();
        $this->assertAuthenticatedAs($user);
        $this->actingAs($user->fresh())->getJson('/_security/protected')->assertStatus(423)->assertDontSee('protected data');
        $this->postJson('/session/unlock', ['pin' => '000000'])->assertStatus(422);
        $this->postJson('/session/unlock', ['pin' => '123456'])->assertOk();
        $this->actingAs($user->fresh())->getJson('/_security/protected')->assertOk()->assertJsonPath('secret', 'protected data');
    }

    public function test_pin_enrollment_is_required_and_needs_current_password(): void
    {
        $user = $this->user();
        $user->forceFill(['session_pin_hash' => null])->save();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token])->get('/_security/protected')->assertRedirect('/session/lock');
        $this->putJson('/session/pin', ['current_password' => 'wrong', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertStatus(422);
        $this->putJson('/session/pin', ['current_password' => 'StrongPassword!123', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertOk();
        $this->assertTrue(Hash::check('654321', $user->fresh()->session_pin_hash));
        foreach (['session_pin_hash', 'active_session_token', 'remember_token'] as $secret) {
            $this->assertArrayNotHasKey($secret, $user->fresh()->toArray());
        }
    }

    public function test_pin_attempts_are_limited_per_account(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/session/unlock', ['pin' => '000000'])->assertStatus(422);
        }
        $this->postJson('/session/unlock', ['pin' => '123456'])->assertStatus(422)->assertJsonValidationErrors('pin');
    }

    public function test_background_locks_and_status_checks_do_not_consume_pin_setup_attempts(): void
    {
        $user = $this->user();
        $user->forceFill(['session_pin_hash' => null])->save();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        for ($event = 0; $event < 8; $event++) {
            $this->postJson('/session/lock')->assertOk();
            $this->getJson('/session/status')->assertOk();
        }
        $this->putJson('/session/pin', ['current_password' => 'StrongPassword!123', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertOk();
        $this->assertTrue(Hash::check('654321', $user->fresh()->session_pin_hash));
    }

    public function test_returning_within_two_minutes_does_not_require_a_pin(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/away')->assertOk()->assertJsonPath('locked', false)->assertJsonPath('grace_seconds', 120);
        $this->travel(60)->seconds();
        $this->getJson('/_security/protected')->assertOk();
        $this->postJson('/session/resume')->assertOk()->assertJsonPath('locked', false);
        $this->assertNull($user->fresh()->session_away_at);
        $this->travel(180)->seconds();
        $this->actingAs($user->fresh())->getJson('/_security/protected')->assertOk();
    }

    public function test_expired_away_time_is_enforced_before_protected_content_is_returned(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/away')->assertOk();
        $this->travel(121)->seconds();
        $this->actingAs($user->fresh())->getJson('/_security/protected')->assertStatus(423)->assertDontSee('protected data');
        $this->postJson('/session/resume')->assertOk()->assertJsonPath('locked', true);
        $this->postJson('/session/unlock', ['pin' => '123456'])->assertOk();
        $this->assertNull($user->fresh()->session_away_at);
        $this->travel(180)->seconds();
        $this->actingAs($user->fresh())->getJson('/_security/protected')->assertOk();
    }

    public function test_repeated_blur_notifications_cannot_extend_the_grace_period(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/away')->assertOk();
        $departure = $user->fresh()->session_away_at->timestamp;
        $this->travel(90)->seconds();
        $this->postJson('/session/away')->assertOk();
        $this->assertSame($departure, $user->fresh()->session_away_at->timestamp);
        $this->travel(31)->seconds();
        $this->postJson('/session/resume')->assertOk()->assertJsonPath('locked', true);
    }

    public function test_status_checks_do_not_reset_the_departure_timer(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/away')->assertOk();
        for ($check = 0; $check < 4; $check++) {
            $this->travel(30)->seconds();
            $this->actingAs($user->fresh())->getJson('/session/status')->assertOk()->assertJsonPath('locked', $check === 3);
        }
    }

    public function test_fresh_login_clears_an_old_departure_and_uses_a_new_timer_context(): void
    {
        $user = $this->user();
        $oldContext = app(SessionSecurity::class)->state($user)['context'];
        $user->forceFill(['session_away_at' => now()->subMinutes(5)])->save();
        app(SessionSecurity::class)->activate($this->loginRequest(), $user);
        $this->assertNull($user->fresh()->session_away_at);
        $state = app(SessionSecurity::class)->state($user->fresh());
        $this->assertFalse($state['locked']);
        $this->assertNotSame($oldContext, $state['context']);
    }

    public function test_manual_lock_stays_immediate_and_cannot_be_cleared_by_resuming(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/lock')->assertOk();
        $this->postJson('/session/resume')->assertOk()->assertJsonPath('locked', true);
    }

    public function test_background_locks_do_not_consume_pin_unlock_attempts(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        for ($event = 0; $event < 12; $event++) {
            $this->postJson('/session/lock')->assertOk();
        }
        $this->postJson('/session/unlock', ['pin' => '123456'])->assertOk();
        $this->assertNull($user->fresh()->session_locked_at);
    }

    public function test_previous_shared_rate_limit_counts_do_not_block_first_pin_setup(): void
    {
        Route::middleware(['web', 'auth', 'throttle:120,1'])->post('/session/_legacy-counter-test', fn () => response()->noContent());
        $user = $this->user();
        $user->forceFill(['session_pin_hash' => null])->save();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        for ($event = 0; $event < 8; $event++) {
            $this->postJson('/session/_legacy-counter-test')->assertNoContent();
        }
        $this->putJson('/session/pin', ['current_password' => 'StrongPassword!123', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertOk();
    }

    public function test_pin_setup_still_limits_repeated_submissions_and_recovers_after_cooldown(): void
    {
        $user = $this->user();
        $user->forceFill(['session_pin_hash' => null])->save();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->putJson('/session/pin', ['current_password' => 'wrong', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertStatus(422);
        }
        $limited = $this->putJson('/session/pin', ['current_password' => 'StrongPassword!123', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertStatus(429);
        $this->assertGreaterThan(0, (int) $limited->headers->get('Retry-After'));
        $this->travel(61)->seconds();
        $this->putJson('/session/pin', ['current_password' => 'StrongPassword!123', 'pin' => '654321', 'pin_confirmation' => '654321'])->assertOk();
    }

    public function test_lock_versions_increase_so_delayed_updates_cannot_override_a_new_unlock(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token]);
        $this->postJson('/session/lock')->assertOk();
        $lockedVersion = (int) $user->fresh()->session_lock_version;
        $unlocked = $this->postJson('/session/unlock', ['pin' => '123456'])->assertOk();
        $this->assertGreaterThan($lockedVersion, $unlocked->json('version'));
        $this->postJson('/session/lock')->assertOk();
        $this->assertGreaterThan($unlocked->json('version'), (int) $user->fresh()->session_lock_version);
        $this->assertNotNull($user->fresh()->session_locked_at);
    }

    public function test_login_activity_view_is_scoped_to_the_admin_barangay(): void
    {
        $admin = $this->user();
        app(SessionSecurity::class)->activate($this->loginRequest(), $admin);
        LoginActivity::create(['user_id' => Str::uuid(), 'barangay_id' => 'other-barangay', 'account_id' => 'FOREIGN', 'user_name' => 'Other Account', 'role' => 'resident', 'signed_in_at' => now()]);
        $this->actingAs($admin)->withSession(['active_session_token' => $admin->active_session_token])->get('/admin/login-activity', ['X-Inertia' => 'true'])->assertOk()->assertJsonCount(1, 'props.logs.data')->assertJsonPath('props.logs.data.0.account_id', $admin->account_id)->assertDontSee('FOREIGN');
    }

    public function test_admin_login_activity_only_includes_admin_and_personnel_accounts_in_their_barangay(): void
    {
        $admin = $this->user();
        $staff = $this->user('personnel');
        $foreign = $this->user();
        $foreign->forceFill(['barangay_id' => 'other-barangay'])->save();
        $this->recordLogin($admin, ['account_id' => 'LOCAL-ADMIN', 'signed_in_at' => now()->subMinute()]);
        $this->recordLogin($staff, ['account_id' => 'LOCAL-STAFF']);
        $this->recordLogin($this->user('resident'), ['account_id' => 'PRIVATE-RESIDENT']);
        $this->recordLogin($this->user('super_admin'), ['account_id' => 'SUPER-ADMIN']);
        $this->recordLogin($foreign, ['account_id' => 'FOREIGN-ADMIN']);

        $this->actingAs($admin)->withSession(['active_session_token' => $admin->active_session_token])
            ->get('/admin/login-activity', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonCount(2, 'props.logs.data')
            ->assertJsonPath('props.logs.data.0.account_id', 'LOCAL-STAFF')
            ->assertJsonPath('props.logs.data.1.account_id', 'LOCAL-ADMIN')
            ->assertDontSee('PRIVATE-RESIDENT')->assertDontSee('SUPER-ADMIN')->assertDontSee('FOREIGN-ADMIN');
        $this->get('/admin/login-activity?role=personnel', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonCount(1, 'props.logs.data')->assertJsonPath('props.logs.data.0.role', 'personnel');
        $this->get('/admin/login-activity?search=PRIVATE-RESIDENT', ['X-Inertia' => 'true'])->assertOk()->assertJsonCount(0, 'props.logs.data');
    }

    public function test_admin_cannot_request_resident_or_super_admin_logs_through_role_filters(): void
    {
        $admin = $this->user();
        $this->actingAs($admin)->withSession(['active_session_token' => $admin->active_session_token]);
        foreach (['resident', 'super_admin'] as $role) {
            $this->getJson('/admin/login-activity?role='.$role)->assertUnprocessable()->assertJsonValidationErrors('role');
        }
    }

    public function test_resident_login_activity_is_always_scoped_to_the_authenticated_account(): void
    {
        $resident = $this->user('resident');
        $other = $this->user('resident');
        $own = $this->recordLogin($resident);
        $this->recordLogin($other, ['account_id' => 'OTHER-RESIDENT', 'ip_address' => '198.51.100.99']);
        $this->recordLogin($this->user(), ['account_id' => 'ADMIN-ONLY']);

        $this->actingAs($resident)->withSession(['active_session_token' => $resident->active_session_token])
            ->get('/profile/login-activity?user_id='.$other->id.'&role=admin', ['X-Inertia' => 'true'])
            ->assertOk()->assertJsonPath('component', 'Resident/Profile/LoginActivity')
            ->assertJsonCount(1, 'props.logs.data')->assertJsonPath('props.logs.data.0.id', $own->id)
            ->assertJsonPath('props.logs.data.0.ip_address', '203.0.113.10')
            ->assertJsonPath('props.logs.data.0.browser', 'Chrome')
            ->assertJsonPath('props.logs.data.0.device', 'Android')
            ->assertJsonPath('props.logs.data.0.approximate_location', 'Paranaque, Metro Manila, Philippines')
            ->assertJsonPath('props.logs.data.0.signed_in_at', $own->signed_in_at->toJSON())
            ->assertJsonMissingPath('props.logs.data.0.user_id')
            ->assertDontSee('OTHER-RESIDENT')->assertDontSee('198.51.100.99')->assertDontSee('ADMIN-ONLY');
    }

    public function test_resident_login_activity_pagination_contains_only_their_own_history_newest_first(): void
    {
        $resident = $this->user('resident');
        $other = $this->user('resident');
        $first = null;
        for ($index = 0; $index < 21; $index++) {
            $activity = $this->recordLogin($resident, ['signed_in_at' => now()->subMinutes($index)]);
            $first ??= $activity;
            $this->recordLogin($other);
        }

        $this->actingAs($resident)->withSession(['active_session_token' => $resident->active_session_token])
            ->get('/profile/login-activity', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonCount(10, 'props.logs.data')->assertJsonPath('props.logs.total', 21)
            ->assertJsonPath('props.logs.data.0.id', $first->id)->assertJsonPath('props.logs.last_page', 3);
        $this->get('/profile/login-activity?page=3', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonCount(1, 'props.logs.data')->assertJsonPath('props.logs.current_page', 3);
    }

    public function test_residents_can_filter_their_login_activity_by_date(): void
    {
        $resident = $this->user('resident');
        $this->recordLogin($resident, ['signed_in_at' => '2026-11-27 10:00:00']);
        $match = $this->recordLogin($resident, ['signed_in_at' => '2026-11-28 10:00:00']);
        $this->recordLogin($resident, ['signed_in_at' => '2026-11-29 10:00:00']);
        $this->recordLogin($this->user('resident'), ['signed_in_at' => '2026-11-28 10:00:00']);

        $this->actingAs($resident)->withSession(['active_session_token' => $resident->active_session_token])
            ->get('/profile/login-activity?from=2026-11-28&to=2026-11-28', ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonCount(1, 'props.logs.data')->assertJsonPath('props.logs.data.0.id', $match->id)
            ->assertJsonPath('props.filters.from', '2026-11-28')->assertJsonPath('props.filters.to', '2026-11-28');
        $this->getJson('/profile/login-activity?from=invalid')->assertUnprocessable()->assertJsonValidationErrors('from');
    }

    public function test_login_activity_routes_require_the_correct_account_role(): void
    {
        $this->get('/profile/login-activity')->assertRedirect('/login');
        foreach (['admin', 'personnel', 'super_admin'] as $role) {
            $user = $this->user($role);
            $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token])
                ->get('/profile/login-activity')->assertForbidden();
        }
        $resident = $this->user('resident');
        $this->actingAs($resident)->withSession(['active_session_token' => $resident->active_session_token])
            ->get('/admin/login-activity')->assertForbidden();
    }

    public function test_locked_resident_session_cannot_access_login_history(): void
    {
        $resident = $this->user('resident');
        $resident->forceFill(['session_locked_at' => now()])->save();
        $this->actingAs($resident)->withSession(['active_session_token' => $resident->active_session_token])
            ->getJson('/profile/login-activity')->assertStatus(423)->assertJsonPath('code', 'session_locked');
    }

    public function test_revoked_logout_does_not_revoke_the_new_device(): void
    {
        $user = $this->user();
        $current = $user->active_session_token;
        $remember = $user->remember_token;
        $this->actingAs($user)->withSession(['active_session_token' => 'old-token'])->postJson('/logout')->assertStatus(401);
        $this->assertSame($current, $user->fresh()->active_session_token);
        $this->assertSame($remember, $user->fresh()->remember_token);
    }

    public function test_current_logout_clears_session_and_remember_credentials(): void
    {
        $user = $this->user();
        $this->actingAs($user)->withSession(['active_session_token' => $user->active_session_token])->post('/logout')->assertRedirect('/admin-personnel/login');
        $this->assertNull($user->fresh()->active_session_token);
        $this->assertNull($user->fresh()->remember_token);
        $this->assertGuest();
    }
}
