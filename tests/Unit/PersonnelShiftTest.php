<?php

namespace Tests\Unit;

use App\Enums\PersonnelShift;
use App\Models\Personnel;
use Carbon\Carbon;
use Tests\TestCase;

class PersonnelShiftTest extends TestCase
{
    public function test_current_shift_changes_at_the_configured_daily_boundaries(): void
    {
        $cases = [
            '2026-11-01 07:59:00' => PersonnelShift::Overnight,
            '2026-11-01 08:00:00' => PersonnelShift::Morning,
            '2026-11-01 15:59:00' => PersonnelShift::Morning,
            '2026-11-01 16:00:00' => PersonnelShift::Evening,
            '2026-11-01 23:59:00' => PersonnelShift::Evening,
            '2026-11-02 00:00:00' => PersonnelShift::Overnight,
        ];

        try {
            foreach ($cases as $time => $expectedShift) {
                Carbon::setTestNow(Carbon::parse($time, 'Asia/Manila'));

                $this->assertSame($expectedShift, PersonnelShift::current());
            }
        } finally {
            Carbon::setTestNow();
        }
    }

    public function test_shifts_roll_forward_in_the_defined_order(): void
    {
        $this->assertSame(PersonnelShift::Evening, PersonnelShift::Morning->next());
        $this->assertSame(PersonnelShift::Overnight, PersonnelShift::Evening->next());
        $this->assertSame(PersonnelShift::Morning, PersonnelShift::Overnight->next());
    }

    public function test_only_peace_and_order_tanods_have_shift_schedules(): void
    {
        $tanod = new Personnel(['role' => 'tanod', 'department' => 'Peace & Order', 'shift' => 'morning']);
        $legacyTanod = new Personnel(['role' => 'tanod', 'department' => 'peace_order', 'shift' => 'morning']);
        $lupon = new Personnel(['role' => 'lupon', 'department' => 'Peace & Order', 'shift' => 'morning']);
        $otherDepartmentTanod = new Personnel(['role' => 'tanod', 'department' => 'Traffic Management', 'shift' => 'morning']);

        $this->assertTrue($tanod->hasShiftSchedule());
        $this->assertTrue($legacyTanod->hasShiftSchedule());
        $this->assertFalse($lupon->hasShiftSchedule());
        $this->assertFalse($otherDepartmentTanod->hasShiftSchedule());
    }
}
