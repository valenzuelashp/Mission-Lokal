<?php

namespace Tests\Unit;

use App\Enums\AdminType;
use App\Enums\UserRole;
use App\Models\User;
use Tests\TestCase;

class AdminTypeAccessTest extends TestCase
{
    public function test_general_and_radio_room_admins_have_equal_full_access(): void
    {
        foreach ([AdminType::General, AdminType::RadioRoom] as $adminType) {
            $admin = new User([
                'role' => UserRole::Admin,
                'admin_type' => $adminType,
                'is_view_only' => false,
            ]);

            $this->assertTrue($admin->canModifySystem(), $adminType->label());
        }
    }

    public function test_view_only_admin_remains_read_only_regardless_of_slot_type(): void
    {
        $admin = new User([
            'role' => UserRole::Admin,
            'admin_type' => AdminType::RadioRoom,
            'is_view_only' => true,
        ]);

        $this->assertFalse($admin->canModifySystem());
    }
}