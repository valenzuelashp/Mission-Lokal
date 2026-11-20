<?php

namespace Tests\Unit;

use App\Models\LibraryItem;
use App\Services\BarangayHelpAnswer;
use App\Services\BarangayHelpKnowledge;
use Tests\TestCase;

class BarangayHelpKnowledgeTest extends TestCase
{
    private function source(string $id, string $title, string $text): array
    {
        return ['id' => $id, 'title' => $title, 'text' => $text, 'type' => 'faq', 'phone' => null, 'url' => '/library#library-'.$id, 'updated_at' => null];
    }

    public function test_filipino_and_typo_queries_find_relevant_english_records(): void
    {
        $knowledge = new BarangayHelpKnowledge;
        $sources = [
            $this->source('unrelated', 'Road safety', 'Keep access roads clear.'),
            $this->source('clearance', 'Clearance requirements', 'Ask staff to review supporting documents.'),
        ];
        self::assertSame('clearance', $knowledge->rank('ano po kelangan sa clearnce', $sources)[0]['id']);
    }

    public function test_a_schedule_keyword_does_not_make_an_unrelated_schedule_relevant(): void
    {
        $knowledge = new BarangayHelpKnowledge;
        $ranked = $knowledge->rank('What is the garbage collection schedule?', [
            $this->source('office', 'Office hours', 'The office opens on weekdays.'),
            $this->source('waste', 'Waste collection schedule', 'Collection is on Thursday.'),
        ]);
        self::assertSame(['waste'], array_column($ranked, 'id'));
    }

    public function test_fees_and_processing_times_are_not_answered_with_form_requirements(): void
    {
        $knowledge = new BarangayHelpKnowledge;
        $source = $this->source('clearance', 'Clearance requirements', 'Online form fields include a purpose.');
        self::assertSame([], $knowledge->rank('How much is clearance?', [$source]));
        self::assertSame([], $knowledge->rank('How long does clearance processing take?', [$source]));
    }

    public function test_relevant_information_after_large_irrelevant_documents_is_not_truncated_away(): void
    {
        $knowledge = new BarangayHelpKnowledge;
        $ranked = $knowledge->rank('How do I segregate waste?', [
            $this->source('first', 'Road safety', str_repeat('Keep roads clear. ', 1000)),
            $this->source('last', 'Waste segregation', 'Separate recyclables from other waste.'),
        ]);
        self::assertSame('last', $ranked[0]['id']);
        self::assertStringContainsString('Separate recyclables', $ranked[0]['text']);
    }

    public function test_long_sources_preserve_relevant_complete_passages(): void
    {
        $knowledge = new BarangayHelpKnowledge;
        $ranked = $knowledge->rank('What is the clearance fee?', [
            $this->source('long', 'Public service information', str_repeat('The office has a waiting area. ', 400)."\nClearance fee: PHP 75, subject to the published exemption policy."),
        ]);
        self::assertStringContainsString('Clearance fee: PHP 75, subject to the published exemption policy.', $ranked[0]['text']);
        self::assertLessThanOrEqual(2400, mb_strlen($ranked[0]['text']));
    }

    public function test_untrusted_metadata_is_not_part_of_public_evidence(): void
    {
        $item = (new LibraryItem)->forceFill([
            'id' => 'public', 'title' => 'Public contact', 'type' => 'contact',
            'metadata' => ['phone' => '02-8123-4567', 'internal_notes' => 'SECRET', 'password' => 'SECRET'],
        ]);
        $source = (new BarangayHelpKnowledge)->sources(collect([$item]))[0];
        self::assertStringNotContainsString('SECRET', $source['text']);
        self::assertSame('02-8123-4567', $source['phone']);
    }

    public function test_model_thought_parts_are_never_shown_as_answer_text(): void
    {
        self::assertSame('Visible answer', (new BarangayHelpAnswer)->generatedText([
            'content' => ['parts' => [['thought' => true, 'text' => 'Hidden reasoning'], ['text' => 'Visible answer']]],
        ]));
    }

    public function test_invalid_evidence_shapes_cannot_crash_or_claim_verification(): void
    {
        $answers = new BarangayHelpAnswer;
        self::assertNull($answers->generated([
            'kind' => 'answer', 'guidance' => '', 'evidence' => [['source_id' => ['invalid'], 'quote' => 'Anything at all']],
        ], [], 'What are the rules?'));
    }

    public function test_general_collection_schedule_does_not_invent_office_hours(): void
    {
        $answer = (new BarangayHelpAnswer)->fallback('What is the barangay garbage collection schedule?', true);
        self::assertStringNotContainsString('8:00', $answer['answer']);
        self::assertStringContainsString('Schedules vary by service', $answer['answer']);
    }

    public function test_multiple_question_facets_can_retrieve_both_kinds_of_evidence(): void
    {
        $sources = (new BarangayHelpKnowledge)->rank('What are the office hours and fees?', [
            $this->source('hours', 'Office hours', 'Office opening hours are published separately.'),
            $this->source('fees', 'Office service fees', 'The office fee list is available from staff.'),
        ]);
        self::assertEqualsCanonicalizing(['hours', 'fees'], array_column($sources, 'id'));
    }

    public function test_emergency_preparation_and_actual_emergencies_have_different_behaviors(): void
    {
        $answers = new BarangayHelpAnswer;
        self::assertFalse($answers->isEmergency('How do I prepare for an emergency?'));
        self::assertTrue($answers->isEmergency('May sunog dito, tulong!'));
        self::assertTrue($answers->isEmergency('May nasaksak dito.'));
    }
}
