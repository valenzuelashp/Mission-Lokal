<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class RegistrationValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_is_rejected_when_resident_record_is_missing_from_barangay_records(): void
    {
        $response = $this->from('/register')->post('/register', [
            'first_name' => 'Juan',
            'middle_name' => '',
            'last_name' => 'Dela Cruz',
            'name_extension' => '',
            'house_street' => '123 Sample Street',
            'barangay_name' => 'Barangay Uno',
            'city' => 'Taguig',
            'province' => 'Metro Manila',
            'birthday' => '1995-01-01',
            'email' => 'juan.dela.cruz@example.com',
            'mobile' => '09171234567',
            'sex' => 'Male',
            'civil_status' => 'Single',
            'government_id' => UploadedFile::fake()->create('id.jpg', 100, 'image/jpeg'),
            'consent' => '1',
            'parent_name' => '',
            'parent_contact' => '',
        ]);

        $response->assertSessionHasErrors(['general']);
        $this->assertDatabaseMissing('users', ['email' => 'juan.dela.cruz@example.com']);
        $this->assertDatabaseMissing('resident_registrations', ['email' => 'juan.dela.cruz@example.com']);
    }
}
