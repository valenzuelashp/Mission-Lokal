<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\ResidentRegistration;
use Carbon\Carbon;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ResidentRegistrationTest extends TestCase
{
    private string $barangayId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(HandleInertiaRequests::class);
        $this->travelTo(Carbon::parse('2026-11-21 12:00:00'));
        Storage::fake('resident-registration-tests');
        Storage::set('local', Storage::disk('resident-registration-tests'));
        $this->barangayId = (string) Str::uuid();

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id')->nullable();
            $table->string('account_id')->nullable();
            $table->string('role')->default('resident');
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_extension')->nullable();
            $table->string('email')->unique();
            $table->string('mobile')->nullable();
            $table->string('parent_name')->nullable();
            $table->string('parent_contact')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
        Schema::create('resident_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id');
            $table->string('verification_status');
            $table->date('birthday');
            $table->text('address')->nullable();
            $table->integer('civic_xp')->default(50);
            $table->string('digital_id_verification_token')->nullable();
            $table->timestamps();
        });
        Schema::create('resident_registrations', function (Blueprint $table) {
            $table->id();
            $table->uuid('barangay_id')->nullable();
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('name_extension')->nullable();
            $table->date('birthday');
            $table->string('email')->unique();
            foreach (['house_street', 'barangay_name', 'city', 'province', 'mobile', 'government_id_path', 'parent_name', 'parent_contact'] as $column) {
                $table->string($column)->nullable();
            }
            $table->timestamps();
        });
        Schema::create('barangays', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code');
            $table->string('name');
            $table->string('city');
            $table->string('province');
            $table->boolean('is_active')->default(true);
        });

        DB::table('barangays')->insert([
            'id' => $this->barangayId,
            'code' => 'TEST-B1',
            'name' => 'Tambo',
            'city' => 'Parañaque',
            'province' => 'Metro Manila',
        ]);
    }

    protected function tearDown(): void
    {
        $disk = Storage::disk('resident-registration-tests');
        $disk->delete($disk->allFiles());
        Schema::dropIfExists('resident_profiles');
        Schema::dropIfExists('resident_registrations');
        Schema::dropIfExists('users');
        Schema::dropIfExists('barangays');
        $this->travelBack();

        parent::tearDown();
    }

    private function identity(array $overrides = []): array
    {
        return array_replace([
            'first_name' => 'Juan',
            'middle_name' => '',
            'no_middle_name' => true,
            'last_name' => 'Dela Cruz',
            'name_extension' => '',
            'birthday' => '2000-05-15',
            'email' => 'juan.registration@gmail.com',
            'mobile' => '09123456789',
            'parent_name' => '',
            'parent_contact' => '',
        ], $overrides);
    }

    private function registration(array $overrides = []): array
    {
        return array_replace($this->identity(), [
            'province' => 'Metro Manila',
            'city' => 'Parañaque',
            'barangay_name' => 'Tambo',
            'house_street' => '12 Test Street',
            'government_id' => UploadedFile::fake()->create('government-id.pdf', 100, 'application/pdf'),
            'consent' => true,
        ], $overrides);
    }

    private function existingUser(array $overrides = []): string
    {
        $id = (string) Str::uuid();
        DB::table('users')->insert(array_replace([
            'id' => $id,
            'first_name' => 'Existing',
            'last_name' => 'Resident',
            'email' => 'existing@gmail.com',
        ], $overrides));

        return $id;
    }

    public function test_valid_identity_can_continue_without_creating_records_or_storing_files(): void
    {
        $this->from('/register')->post('/register/identity', $this->identity())
            ->assertRedirect('/register')->assertSessionHasNoErrors();

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('resident_registrations', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_empty_identity_is_blocked_before_the_address_step(): void
    {
        $this->from('/register')->post('/register/identity', [])
            ->assertRedirect('/register')
            ->assertSessionHasErrors(['first_name', 'last_name', 'birthday', 'email', 'mobile']);
    }

    #[DataProvider('invalidIdentityInputs')]
    public function test_invalid_details_are_blocked_on_both_identity_and_final_submission(array $overrides, string $field): void
    {
        $this->postJson('/register/identity', $this->identity($overrides))
            ->assertUnprocessable()->assertJsonValidationErrors($field);
        $this->postJson('/register', $this->registration($overrides))
            ->assertUnprocessable()->assertJsonValidationErrors($field);

        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('resident_registrations', 0);
    }

    public static function invalidIdentityInputs(): array
    {
        return [
            'blank name' => [['first_name' => '   '], 'first_name'],
            'malformed birthday' => [['birthday' => 'not-a-date'], 'birthday'],
            'impossible birthday' => [['birthday' => '2010-02-30'], 'birthday'],
            'younger than twelve' => [['birthday' => '2014-11-22'], 'birthday'],
            'invalid email' => [['email' => 'invalid'], 'email'],
            'non Gmail address' => [['email' => 'juan@example.com'], 'email'],
            'short phone number' => [['mobile' => '09123'], 'mobile'],
            'wrong phone prefix' => [['mobile' => '08123456789'], 'mobile'],
            'minor missing guardian' => [['birthday' => '2011-05-15'], 'parent_name'],
            'minor missing guardian phone' => [['birthday' => '2011-05-15', 'parent_name' => 'Guardian'], 'parent_contact'],
            'minor invalid guardian phone' => [['birthday' => '2011-05-15', 'parent_name' => 'Guardian', 'parent_contact' => '123'], 'parent_contact'],
        ];
    }

    public function test_email_already_used_by_an_account_blocks_continuing_even_with_different_casing(): void
    {
        $this->existingUser();

        $this->postJson('/register/identity', $this->identity(['email' => ' EXISTING@GMAIL.COM ']))
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('resident_registrations', 0);
    }

    public function test_pending_application_email_blocks_continuing(): void
    {
        DB::table('resident_registrations')->insert([
            'first_name' => 'Another', 'last_name' => 'Applicant',
            'birthday' => '1990-01-01', 'email' => 'existing@gmail.com',
        ]);

        $this->postJson('/register/identity', $this->identity(['email' => 'existing@gmail.com']))
            ->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_same_person_cannot_continue_with_another_email_when_already_approved(): void
    {
        $userId = $this->existingUser(['first_name' => 'Juan', 'last_name' => 'Dela Cruz']);
        DB::table('resident_profiles')->insert([
            'user_id' => $userId, 'birthday' => '2000-05-15', 'verification_status' => 'approved',
        ]);

        $this->postJson('/register/identity', $this->identity())
            ->assertUnprocessable()->assertJsonValidationErrors('general');
    }

    public function test_same_person_cannot_continue_with_another_email_when_pending(): void
    {
        DB::table('resident_registrations')->insert([
            'first_name' => ' JUAN ', 'last_name' => 'DELA CRUZ',
            'birthday' => '2000-05-15', 'email' => 'another@gmail.com',
        ]);

        $this->postJson('/register/identity', $this->identity())
            ->assertUnprocessable()->assertJsonValidationErrors('general');
    }

    public function test_exactly_twelve_year_old_with_guardian_can_continue(): void
    {
        $this->from('/register')->post('/register/identity', $this->identity([
            'birthday' => '2014-11-21', 'parent_name' => 'Guardian', 'parent_contact' => '09987654321',
        ]))->assertRedirect('/register')->assertSessionHasNoErrors();
    }

    public function test_final_submission_rechecks_email_availability(): void
    {
        $this->from('/register')->post('/register/identity', $this->identity())->assertSessionHasNoErrors();
        $this->existingUser(['email' => $this->identity()['email']]);

        $this->postJson('/register', $this->registration())
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('resident_registrations', 0);
        $this->assertSame([], Storage::disk('local')->allFiles());
    }

    public function test_final_submission_requires_address_id_and_consent(): void
    {
        $this->postJson('/register', $this->identity())
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['house_street', 'province', 'city', 'barangay_name', 'government_id', 'consent']);
    }

    public function test_unsupported_location_or_inactive_barangay_cannot_be_submitted(): void
    {
        $this->postJson('/register', $this->registration(['city' => 'Different City']))
            ->assertUnprocessable()->assertJsonValidationErrors(['city', 'barangay_name']);

        DB::table('barangays')->where('id', $this->barangayId)->update(['is_active' => false]);
        $this->postJson('/register', $this->registration())
            ->assertUnprocessable()->assertJsonValidationErrors(['province', 'city', 'barangay_name']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_valid_final_submission_creates_one_pending_application_and_encrypted_id(): void
    {
        $this->from('/register')->post('/register', $this->registration())
            ->assertRedirect('/register')->assertSessionHasNoErrors()->assertSessionHas('success');

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('resident_registrations', 1);
        $this->assertDatabaseHas('users', ['email' => 'juan.registration@gmail.com', 'middle_name' => 'N/A']);
        $this->assertDatabaseHas('resident_profiles', ['verification_status' => 'pending']);
        $registration = ResidentRegistration::firstOrFail();
        $this->assertSame($this->barangayId, $registration->barangay_id);
        $this->assertStringEndsWith('.enc', $registration->government_id_path);
        Storage::disk('local')->assertExists($registration->government_id_path);
    }
}
