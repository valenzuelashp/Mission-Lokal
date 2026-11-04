<?php

namespace Tests\Unit;

use App\Models\Barangay;
use App\Models\DocumentTemplate;
use App\Models\LibraryItem;
use App\Models\ResidentProfile;
use App\Models\User;
use App\Services\BarangayHelpAnswer;
use App\Services\Documents\DocumentCatalog;
use App\Services\Documents\DocumentRenderer;
use Illuminate\Support\Collection;
use Tests\TestCase;

class DocumentCatalogTest extends TestCase
{
    public function test_barangay_request_templates_include_the_published_required_fields(): void
    {
        $templates = collect(DocumentCatalog::defaults())->keyBy('key');

        $this->assertSame(
            ['first_name', 'middle_name', 'last_name', 'address', 'age', 'length_of_stay', 'education_attainment', 'contact_number', 'facebook_account', 'birthday'],
            $templates['first_time_jobseeker']['resident_fields'],
        );
        $this->assertSame(
            ['first_name', 'middle_name', 'last_name', 'address', 'birthday', 'birth_place'],
            $templates['barangay_id']['resident_fields'],
        );
        $this->assertSame(
            ['first_name', 'middle_name', 'surname', 'alias', 'address', 'gender', 'birthday', 'age', 'birthplace', 'civil_status', 'citizenship', 'purpose'],
            $templates['barangay_clearance']['resident_fields'],
        );
        $this->assertSame(
            ['name', 'middle_name', 'surname', 'address', 'position'],
            $templates['working_permit']['resident_fields'],
        );

        $this->assertContains('purpose', $templates['indigency']['resident_fields']);
        $this->assertSame('Facebook Account', DocumentCatalog::fields()['facebook_account']);
        $this->assertSame('Status', DocumentCatalog::fields()['civil_status']);
    }

    public function test_submitted_document_details_are_used_in_the_rendered_certificate(): void
    {
        $resident = new User;
        $resident->forceFill([
            'first_name' => 'Profile',
            'last_name' => 'Resident',
        ]);
        $resident->setRelation('residentProfile', new ResidentProfile);
        $resident->setRelation('barangay', (new Barangay)->forceFill(['name' => 'Barangay Tambo']));

        $template = (new DocumentTemplate)->forceFill([
            'body' => '{{resident_name}} lives at {{address}}.',
            'signatory_title' => 'Barangay Chairman',
        ]);

        $result = (new DocumentRenderer)->render($template, $resident, [
            'first_name' => 'Liza',
            'middle_name' => 'Cruz',
            'last_name' => 'Santos',
            'address' => 'Zone 1, Tambo',
        ]);

        $this->assertSame('LIZA CRUZ SANTOS lives at Zone 1, Tambo.', $result);
    }

    public function test_known_document_questions_get_exact_requirements_without_ai(): void
    {
        $answer = (new BarangayHelpAnswer)->fromPublishedKnowledge(
            'whats needed for brngy clearance',
            new Collection,
        );

        $this->assertSame(
            "Barangay Clearance Certificate requires: First Name, Middle Name, Surname, Alias, Address, Gender, Birthday, Age, Birthplace, Status, Citizenship, Purpose.\n\nTo request it:\n1. Open Documents and select \"Request this\" for the document.\n2. Complete the required fields and submit the form.\n3. Track it under Your Requests. Wait for barangay review; open the request to print when it is ready.",
            $answer,
        );
    }

    public function test_hotline_questions_use_the_published_contact_numbers(): void
    {
        $landline = new LibraryItem;
        $landline->forceFill([
            'type' => 'contact',
            'title' => 'Barangay Landline',
            'metadata' => ['phone' => '(02) 8654-0596'],
        ]);

        $answer = (new BarangayHelpAnswer)->fromPublishedKnowledge(
            'what is the barangay landline number?',
            collect([$landline]),
        );

        $this->assertSame(
            "Barangay Landline: (02) 8654-0596\nCall the listed number and briefly state your concern and location.",
            $answer,
        );
    }

    public function test_gemini_text_response_includes_every_text_part(): void
    {
        $answer = (new BarangayHelpAnswer)->generatedText([
            'content' => [
                'parts' => [
                    ['text' => 'This is general guidance. To get a barang'],
                    ['text' => 'ay clearance, prepare your ID and proof of residency.'],
                ],
            ],
        ]);

        $this->assertSame(
            'This is general guidance. To get a barangay clearance, prepare your ID and proof of residency.',
            $answer,
        );
    }
}
