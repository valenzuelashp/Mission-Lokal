<?php

namespace Tests\Feature;

use App\Enums\AdminType;
use App\Enums\UserRole;
use App\Models\Barangay;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class AdminDefaultPasswordTest extends TestCase
{
    public function test_admin_is_prompted_while_using_the_generated_default_password(): void
    {
        $barangay = new Barangay();
        $barangay->setAttribute('code', 'TEST-B1');

        $user = new User();
        $user->setAttribute('role', UserRole::Admin);
        $user->setAttribute('admin_type', AdminType::General);
        $user->setAttribute('is_view_only', false);
        $user->setAttribute('is_active', true);
        $user->setAttribute('barangay_id', (string) Str::uuid());
        $user->setAttribute('last_name', 'Smith');
        $user->setAttribute('password', Hash::make('TEST-B1!Smith'));
        $user->setRelation('barangay', $barangay);

        self::assertTrue($user->shouldShowPasswordPrompt());

        $user->setAttribute('password', Hash::make('ChangedPass!123'));
        self::assertFalse($user->shouldShowPasswordPrompt());
    }
}