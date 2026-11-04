<?php

namespace Tests\Unit;

use App\Enums\PersonnelRole;
use App\Enums\PersonnelDepartment;
use App\Models\Concern;
use App\Models\ConcernSubcategory;
use App\Models\Mission;
use App\Models\Personnel;
use App\Models\User;
use App\Services\Missions\DepartmentMissionAccess;
use Tests\TestCase;

class PersonnelDepartmentTest extends TestCase
{
    public function test_personnel_roles_map_to_their_department(): void
    {
        $this->assertSame(PersonnelDepartment::PeaceOrder, PersonnelRole::Tanod->department());
        $this->assertSame(PersonnelDepartment::PeaceOrder, PersonnelRole::Lupon->department());
        $this->assertSame(PersonnelDepartment::PeaceOrder, PersonnelRole::VawDesk->department());
        $this->assertSame(PersonnelDepartment::TrafficManagement, PersonnelRole::TrafficControl->department());
        $this->assertSame(PersonnelDepartment::Environmental, PersonnelRole::Sanitation->department());
        $this->assertSame(PersonnelDepartment::UtilityInfrastructure, PersonnelRole::PublicWorks->department());
        $this->assertSame(PersonnelDepartment::TamboAnimalResponse, PersonnelRole::AnimalResponse->department());
        $this->assertSame(PersonnelDepartment::Maintenance, PersonnelRole::Maintenance->department());
    }

    public function test_concern_routing_recommends_a_department_for_its_operational_type(): void
    {
        $traffic = new Concern(['title' => 'Road obstruction at the main crossing']);
        $environmental = new Concern();
        $environmental->setRelation('category', new \App\Models\ConcernCategory(['code' => 'SANI']));
        $maintenance = new Concern();
        $maintenance->setRelation('subcategory', new ConcernSubcategory(['code' => 'DRAINAGE']));

        $this->assertSame('Traffic Management', $traffic->suggestedPersonnelDepartment());
        $this->assertSame('Environmental', $environmental->suggestedPersonnelDepartment());
        $this->assertSame('Maintenance', $maintenance->suggestedPersonnelDepartment());
    }

    public function test_department_members_can_review_their_queue_but_vawc_is_vaw_desk_only(): void
    {
        $access = new DepartmentMissionAccess();
        $mission = new Mission([
            'department' => PersonnelDepartment::PeaceOrder,
            'barangay_id' => 'brgy-1',
        ]);
        $mission->setRelation('concern', new Concern([
            'title' => 'Noise complaint',
            'description' => 'Loud music at night.',
        ]));
        $mission->concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $tanod = $this->personnel(PersonnelDepartment::PeaceOrder, PersonnelRole::Tanod);
        $this->assertTrue($access->canView($tanod, $mission));

        $mission->setRelation('concern', new Concern([
            'title' => 'Confidential report',
            'description' => 'A VAWC case needs support.',
        ]));
        $mission->concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'VAWC']));

        $vawDesk = $this->personnel(PersonnelDepartment::PeaceOrder, PersonnelRole::VawDesk);
        $this->assertTrue($access->canView($vawDesk, $mission));
        $this->assertFalse($access->canView($tanod, $mission));
    }

    public function test_private_safety_reports_without_vawc_classification_remain_available_to_tanods(): void
    {
        $access = new DepartmentMissionAccess();
        $mission = new Mission([
            'department' => PersonnelDepartment::PeaceOrder,
            'barangay_id' => 'brgy-1',
        ]);
        $mission->setRelation('concern', new Concern([
            'title' => 'Excessive late-night videoke noise past curfew',
            'description' => 'Loud singing and bass amplifiers operating continuously past 1:00 AM.',
            'is_blotter_candidate' => true,
        ]));
        $mission->concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'NOISE']));

        $tanod = $this->personnel(PersonnelDepartment::PeaceOrder, PersonnelRole::Tanod);

        $this->assertTrue($mission->concern->isSensitiveConcern());
        $this->assertFalse($mission->concern->isVawcConcern());
        $this->assertTrue($access->canView($tanod, $mission));
    }

    public function test_ai_classified_vawc_is_recognized_as_vawc(): void
    {
        $concern = new Concern([
            'title' => 'Confidential report',
            'description' => 'Details omitted.',
        ]);
        $analysis = new \App\Models\ConcernAiAnalysis();
        $analysis->setRelation('suggestedSubcategory', new ConcernSubcategory(['code' => 'VAWC']));
        $concern->setRelation('currentAiAnalysis', $analysis);

        $this->assertTrue($concern->isVawcConcern());
    }

    public function test_department_queue_access_is_limited_to_the_personnels_barangay(): void
    {
        $personnel = $this->personnel(PersonnelDepartment::Environmental, PersonnelRole::Sanitation);
        $mission = new Mission([
            'department' => PersonnelDepartment::Environmental,
            'barangay_id' => 'brgy-2',
        ]);
        $mission->setRelation('concern', new Concern(['title' => 'Waste collection']));

        $this->assertFalse((new DepartmentMissionAccess())->canView($personnel, $mission));
    }

    public function test_custom_department_names_are_safe_string_values_for_missions(): void
    {
        $personnel = new Personnel([
            'department' => 'Disaster Risk Reduction',
            'role' => 'Rescue Technician',
        ]);
        $personnel->setRelation('user', new User(['barangay_id' => 'brgy-1']));

        $mission = new Mission([
            'department' => 'Disaster Risk Reduction',
            'barangay_id' => 'brgy-1',
        ]);
        $mission->setRelation('concern', new Concern(['title' => 'Flood response']));
        $mission->concern->setRelation('subcategory', new ConcernSubcategory(['code' => 'FLOOD']));

        $this->assertSame('Disaster Risk Reduction', $mission->department);
        $this->assertTrue((new DepartmentMissionAccess())->canView($personnel, $mission));
    }

    private function personnel(PersonnelDepartment $department, PersonnelRole $role): Personnel
    {
        $personnel = new Personnel([
            'department' => $department,
            'role' => $role,
        ]);
        $personnel->setRelation('user', new User(['barangay_id' => 'brgy-1']));

        return $personnel;
    }
}
