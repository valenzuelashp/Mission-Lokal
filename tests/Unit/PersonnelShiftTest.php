<?php

namespace Tests\Unit;

use App\Enums\PersonnelShift;
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
}
