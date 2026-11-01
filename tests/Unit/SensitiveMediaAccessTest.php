<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\Concern;
use App\Models\ConcernSubcategory;
use App\Models\User;
use App\Services\SensitiveMediaAccess;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class SensitiveMediaAccessTest extends TestCase
{
    public function test_public_vawc_media_is_not_available_to_another_resident(): void
    {
        $concern = new Concern([
            'barangay_id' => 'barangay-1',
            'reporter_id' => 'reporter-1',
            'visibility' => 'public',
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'VAWC']));

        $resident = new User();
        $resident->id = 'resident-2';
        $resident->role = UserRole::Resident;
        $resident->barangay_id = 'barangay-1';

        $this->assertFalse(app(SensitiveMediaAccess::class)->canViewConcern($resident, $concern));
    }

    public function test_reporter_can_view_their_own_private_vawc_media(): void
    {
        $concern = new Concern([
            'barangay_id' => 'barangay-1',
            'reporter_id' => 'resident-1',
            'visibility' => 'private',
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'VAWC']));

        $resident = new User();
        $resident->id = 'resident-1';
        $resident->role = UserRole::Resident;
        $resident->barangay_id = 'barangay-1';

        $this->assertTrue(app(SensitiveMediaAccess::class)->canViewConcern($resident, $concern));
    }

    public function test_safety_flagged_media_is_not_available_to_another_resident(): void
    {
        $concern = new Concern([
            'barangay_id' => 'barangay-1',
            'reporter_id' => 'reporter-1',
            'visibility' => 'public',
            'is_blotter_candidate' => true,
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $resident = new User();
        $resident->id = 'resident-2';
        $resident->role = UserRole::Resident;
        $resident->barangay_id = 'barangay-1';

        $this->assertFalse(app(SensitiveMediaAccess::class)->canViewConcern($resident, $concern));
    }

    public function test_safety_flagged_report_cannot_be_opened_by_another_resident(): void
    {
        $concern = new Concern([
            'barangay_id' => 'barangay-1',
            'reporter_id' => 'reporter-1',
            'visibility' => 'public',
            'is_blotter_candidate' => true,
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $resident = new User();
        $resident->id = 'resident-2';
        $resident->barangay_id = 'barangay-1';

        $this->expectException(HttpException::class);
        $concern->denyUnlessVisibleToResident($resident);
    }

    public function test_public_non_vawc_media_remains_available_to_barangay_residents(): void
    {
        $concern = new Concern([
            'barangay_id' => 'barangay-1',
            'reporter_id' => 'reporter-1',
            'visibility' => 'public',
        ]);
        $concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $resident = new User();
        $resident->id = 'resident-2';
        $resident->role = UserRole::Resident;
        $resident->barangay_id = 'barangay-1';

        $this->assertTrue(app(SensitiveMediaAccess::class)->canViewConcern($resident, $concern));
    }
}
