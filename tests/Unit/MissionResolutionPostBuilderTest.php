<?php

namespace Tests\Unit;

use App\Models\Concern;
use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Models\MissionChecklistItem;
use App\Models\MissionProof;
use App\Models\MissionProofMedia;
use App\Models\Personnel;
use App\Models\User;
use App\Services\Missions\MissionResolutionPostBuilder;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Tests\TestCase;

class MissionResolutionPostBuilderTest extends TestCase
{
    public function test_it_prefills_the_public_update_with_work_details_and_proof_media(): void
    {
        $member = new Personnel(['category' => 'public_works']);
        $member->setRelation('user', new User(['first_name' => 'Alex', 'last_name' => 'Rivera']));

        $assignment = new MissionAssignment();
        $assignment->assigned_at = CarbonImmutable::parse('2026-10-13 08:00:00');

        $step = new MissionChecklistItem(['step_order' => 1, 'description' => 'Cleared the blocked drainage inlet.']);
        $media = new MissionProofMedia(['created_at' => CarbonImmutable::parse('2026-10-13 09:30:00')]);
        $media->id = 'proof-photo-1';
        $proof = new MissionProof();
        $proof->setRelation('media', new Collection([$media]));

        $mission = new Mission(['created_at' => CarbonImmutable::parse('2026-10-13 08:00:00')]);
        $mission->completed_at = CarbonImmutable::parse('2026-10-13 09:30:00');
        $mission->setRelation('personnel', new Collection([$member]));
        $mission->setRelation('assignments', new Collection([$assignment]));
        $mission->setRelation('checklistItems', new Collection([$step]));
        $mission->setRelation('proof', $proof);

        $concern = new Concern([
            'title' => 'Blocked Drainage',
            'public_location' => 'Zone 2',
        ]);

        $template = app(MissionResolutionPostBuilder::class)->build($mission, $concern);

        $this->assertSame('Resolved: Blocked Drainage', $template['title']);
        $this->assertStringContainsString('Alex Rivera (Public works)', $template['body']);
        $this->assertStringContainsString('Cleared the blocked drainage inlet.', $template['body']);
        $this->assertStringContainsString('1 hour 30 minutes', $template['body']);
        $this->assertStringContainsString('Location: Zone 2', $template['body']);
        $this->assertSame(['proof-photo-1'], $template['media_ids']);
    }
}