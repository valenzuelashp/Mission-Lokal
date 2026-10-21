<?php

namespace Tests\Unit;

use App\Support\ConcernStatusUpdate;
use App\Models\ConcernAiAnalysis;
use Tests\TestCase;

class ConcernStatusUpdateTest extends TestCase
{
    public function test_it_formats_public_facing_updates_for_concern_statuses(): void
    {
        $this->assertSame(
            'The barangay has verified this concern and is reviewing it for action.',
            ConcernStatusUpdate::message('under_review'),
        );
        $this->assertSame(
            'The barangay approved this report and created a mission to address it.',
            ConcernStatusUpdate::message('active'),
        );
        $this->assertSame('Approved · mission created', ConcernStatusUpdate::label('active'));
    }

    public function test_resident_updates_begin_only_at_approval_or_rejection_with_a_reason(): void
    {
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('submitted'));
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('ai_processed'));
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('under_review'));
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('active'));
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('rejected', 'Admin status update: rejected'));
        $this->assertFalse(ConcernStatusUpdate::isResidentDecision('rejected', 'Rejected: Dismissed by admin review.'));
        $this->assertTrue(ConcernStatusUpdate::isResidentDecision('active', missionCreated: true));
        $this->assertTrue(ConcernStatusUpdate::isResidentDecision('rejected', 'Rejected: Duplicate report.'));
    }

    public function test_rejection_updates_include_the_recorded_reason(): void
    {
        $this->assertSame(
            'The barangay rejected this concern. Reason: Duplicate report.',
            ConcernStatusUpdate::message('rejected', 'Dismissed/Rejected: Duplicate report.'),
        );
    }

    public function test_resolution_updates_include_the_elapsed_resolution_time(): void
    {
        $this->assertSame(
            'The barangay resolved this concern in 2 days and 3 hours.',
            ConcernStatusUpdate::message('resolved', 'Total resolution time: 2 days and 3 hours.'),
        );
    }

    public function test_it_formats_ai_recommended_steps_and_estimated_completion(): void
    {
        $analysis = new ConcernAiAnalysis([
            'prescriptive_steps' => ['Inspect the site.', 'Repair the damaged section.'],
            'suggested_duration_hours' => 72,
            'suggested_due_date' => '2026-10-24',
        ]);

        $this->assertSame([
            'prescriptive_steps' => ['Inspect the site.', 'Repair the damaged section.'],
            'estimated_duration' => 'about 3 days (72 hours)',
            'estimated_completion' => 'Oct 24, 2026',
        ], ConcernStatusUpdate::plan($analysis));
    }
}
