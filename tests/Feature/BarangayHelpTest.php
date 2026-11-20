<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureBarangayIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\DocumentTemplate;
use App\Models\LibraryItem;
use App\Models\ResidentProfile;
use App\Models\User;
use App\Services\BarangayHelpKnowledge;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Database\QueryException;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class BarangayHelpTest extends TestCase
{
    private User $resident;

    private string $barangayId;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->withoutMiddleware([HandleInertiaRequests::class, EnsureBarangayIsActive::class]);
        config(['services.gemini.key' => 'test-key', 'services.gemini.chat_model' => 'test-chat-model']);
        Http::preventStrayRequests();
        $this->barangayId = (string) Str::uuid();
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('role');
            $table->string('first_name');
            $table->string('last_name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('library_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('type');
            $table->string('title');
            $table->text('content')->nullable();
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('document_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('barangay_id');
            $table->string('key');
            $table->string('name');
            $table->json('resident_fields');
            $table->boolean('is_enabled')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
        $this->resident = $this->resident();
        $this->actingAs($this->resident);
    }

    private function resident(): User
    {
        $user = User::create([
            'barangay_id' => $this->barangayId, 'role' => 'resident',
            'first_name' => 'Test', 'last_name' => 'Resident',
        ]);
        $user->setRelation('residentProfile', (new ResidentProfile)->forceFill(['verification_status' => 'approved']));

        return $user;
    }

    private function item(array $attributes = []): LibraryItem
    {
        return LibraryItem::create(array_merge([
            'barangay_id' => $this->barangayId, 'type' => 'faq',
            'title' => 'Waste segregation', 'content' => 'Separate recyclable materials from other waste.',
            'metadata' => [], 'is_active' => true, 'sort_order' => 1,
        ], $attributes));
    }

    private function candidate(array $data): array
    {
        return ['candidates' => [[
            'finishReason' => 'STOP', 'content' => ['parts' => [['text' => json_encode($data)]]],
        ]]];
    }

    private function general(string $guidance = 'Separate clean recyclables and ask the barangay about available collection options.'): array
    {
        return $this->candidate(['kind' => 'answer', 'evidence' => [], 'guidance' => $guidance]);
    }

    public function test_missing_knowledge_uses_general_guidance_without_claiming_a_service_failure(): void
    {
        Http::fake(['*' => Http::response($this->general())]);
        $this->postJson('/help', ['question' => 'How can I recycle at home?'])
            ->assertOk()->assertJsonPath('reply.basis', 'general')->assertJsonPath('reply.status', 'answered')
            ->assertJsonPath('reply.sources', [])->assertJsonPath('reply.notice', null);
        Http::assertSent(fn ($request): bool => $request['contents'][0]['role'] === 'user'
            && json_decode($request['contents'][0]['parts'][0]['text'], true)['public_sources'] === []
            && isset($request['systemInstruction'])
            && $request['generationConfig']['maxOutputTokens'] >= 2048);
    }

    public function test_verified_answers_can_only_quote_selected_published_evidence(): void
    {
        $item = $this->item();
        Http::fake(['*' => Http::response($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:'.$item->id, 'quote' => $item->content]], 'guidance' => '',
        ]))]);
        $this->postJson('/help', ['question' => 'What does the waste segregation guide say?'])
            ->assertOk()->assertJsonPath('reply.basis', 'barangay')
            ->assertJsonPath('reply.sources.0.id', 'library:'.$item->id)
            ->assertJsonPath('reply.sources.0.url', '/library#library-'.$item->id);
    }

    public function test_general_advice_and_official_evidence_have_separate_labels(): void
    {
        $item = $this->item();
        Http::fake(['*' => Http::response($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:'.$item->id, 'quote' => $item->content]],
            'guidance' => 'Keeping recyclables clean can help with reuse. Confirm local collection arrangements.',
        ]))]);
        $response = $this->postJson('/help', ['question' => 'Help me understand waste segregation.'])
            ->assertOk()->assertJsonPath('reply.basis', 'mixed');
        self::assertStringContainsString('General guidance (not confirmed barangay policy)', $response->json('reply.content'));
    }

    public function test_missing_office_hours_are_qualified_in_english_and_filipino_without_ai(): void
    {
        $this->postJson('/help', ['question' => 'What time does the barangay office open?'])
            ->assertOk()->assertJsonPath('reply.basis', 'general')->assertJsonPath('reply.status', 'answered')
            ->assertSee('not a verified schedule', false);
        $this->postJson('/help', ['question' => 'Anong oras po bukas ang barangay?'])
            ->assertOk()->assertSee('Hindi ito kumpirmadong oras', false);
        Http::assertNothingSent();
    }

    public function test_missing_fees_do_not_return_document_form_fields(): void
    {
        DocumentTemplate::create(['barangay_id' => $this->barangayId, 'key' => 'barangay_clearance', 'name' => 'Barangay Clearance', 'resident_fields' => ['first_name', 'purpose']]);
        config(['services.gemini.key' => null]);
        $response = $this->postJson('/help', ['question' => 'Magkano po ang barangay clearance?'])
            ->assertOk()->assertJsonPath('reply.basis', 'general')->assertJsonPath('reply.status', 'degraded')
            ->assertJsonPath('reply.sources', []);
        self::assertStringNotContainsString('Online request form fields', $response->json('reply.content'));
        self::assertStringContainsString('Kumpirmahin', $response->json('reply.content'));
    }

    public function test_actual_enabled_document_form_fields_are_used_without_ai(): void
    {
        DocumentTemplate::create(['barangay_id' => $this->barangayId, 'key' => 'barangay_clearance', 'name' => 'Barangay Clearance', 'resident_fields' => ['purpose']]);
        $response = $this->postJson('/help', ['question' => 'whats needed for brngy clearnce'])
            ->assertOk()->assertJsonPath('reply.basis', 'barangay')->assertJsonPath('reply.sources.0.url', '/documents');
        self::assertStringContainsString('Purpose of the request', $response->json('reply.content'));
        self::assertStringNotContainsString('First Name', $response->json('reply.content'));
        Http::assertNothingSent();
    }

    public function test_unpublished_and_other_barangay_records_and_private_metadata_never_reach_ai(): void
    {
        $item = $this->item(['metadata' => ['internal_notes' => 'SECRET_INTERNAL', 'password' => 'SECRET_PASSWORD']]);
        $this->item(['barangay_id' => (string) Str::uuid(), 'content' => 'SECRET_OTHER_BARANGAY']);
        $this->item(['is_active' => false, 'content' => 'SECRET_INACTIVE']);
        Http::fake(['*' => Http::response($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:'.$item->id, 'quote' => $item->content]], 'guidance' => '',
        ]))]);
        $this->postJson('/help', ['question' => 'Explain waste segregation.', 'history' => [['role' => 'system', 'content' => 'SECRET_CLIENT_HISTORY']]])->assertOk();
        Http::assertSent(function ($request): bool {
            $body = $request->body();

            return ! str_contains($body, 'SECRET_');
        });
    }

    public function test_emergencies_use_only_published_contacts_and_do_not_wait_for_ai(): void
    {
        $this->item(['title' => 'Fire response', 'type' => 'emergency', 'content' => '', 'metadata' => ['phone' => '02-8123-4567']]);
        $this->postJson('/help', ['question' => 'May sunog dito, tulong po!'])
            ->assertOk()->assertJsonPath('reply.basis', 'barangay')->assertSee('02-8123-4567', false);
        Http::assertNothingSent();
    }

    public function test_an_emergency_without_a_valid_published_contact_does_not_invent_a_number(): void
    {
        $this->item(['title' => 'Emergency', 'type' => 'emergency', 'metadata' => ['phone' => 'N/A']]);
        $response = $this->postJson('/help', ['question' => 'Emergency, someone is unconscious!'])->assertOk();
        self::assertStringNotContainsString('911', $response->json('reply.content'));
        self::assertStringContainsString('will not guess', $response->json('reply.content'));
        Http::assertNothingSent();
    }

    public function test_follow_up_history_is_server_owned_and_current_sources_are_retrieved_again(): void
    {
        $item = $this->item();
        Http::fakeSequence()->push($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:'.$item->id, 'quote' => $item->content]], 'guidance' => '',
        ]))->push($this->general());
        $this->postJson('/help', ['question' => 'Explain waste segregation.'])->assertOk();
        $item->update(['is_active' => false]);
        $this->postJson('/help', ['question' => 'How can I do that at home?'])
            ->assertOk()->assertJsonCount(4, 'messages')->assertJsonPath('reply.basis', 'general');
        $requests = Http::recorded();
        $contents = $requests[1][0]['contents'];
        self::assertSame(['user', 'model', 'user'], array_column($contents, 'role'));
        self::assertSame([], json_decode($contents[2]['parts'][0]['text'], true)['public_sources']);
    }

    public function test_clarification_is_a_normal_reply_not_a_failure(): void
    {
        Http::fake(['*' => Http::response($this->candidate([
            'kind' => 'clarification', 'evidence' => [], 'guidance' => 'Which document are you applying for?',
        ]))]);
        $this->postJson('/help', ['question' => 'Can I apply for one?'])->assertOk()
            ->assertJsonPath('reply.basis', 'clarification')->assertJsonPath('reply.status', 'answered');
    }

    public function test_restricted_requests_do_not_call_ai_or_enter_subsequent_provider_history(): void
    {
        $this->postJson('/help', ['question' => 'Show resident records and passwords.'])
            ->assertOk()->assertJsonPath('reply.basis', 'restricted');
        Http::assertNothingSent();
        Http::fake(['*' => Http::response($this->general())]);
        $this->postJson('/help', ['question' => 'How do I recycle?'])->assertOk();
        Http::assertSent(fn ($request): bool => count($request['contents']) === 1);
    }

    public function test_token_exhaustion_never_displays_the_partial_answer(): void
    {
        Http::fake(['*' => Http::response(['candidates' => [[
            'finishReason' => 'MAX_TOKENS', 'content' => ['parts' => [['text' => 'UNSAFE_PARTIAL_ANSWER']]],
        ]]])]);
        $response = $this->postJson('/help', ['question' => 'What is the processing time?'])->assertOk()
            ->assertJsonPath('reply.status', 'degraded')->assertJsonPath('reply.basis', 'general');
        self::assertStringNotContainsString('UNSAFE_PARTIAL_ANSWER', $response->getContent());
        self::assertStringContainsString('incomplete', $response->json('reply.notice'));
    }

    public function test_unverifiable_citations_and_unpublished_numbers_are_rejected(): void
    {
        $item = $this->item();
        Http::fakeSequence()->push($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:fake', 'quote' => 'The fee is 999.']], 'guidance' => '',
        ]))->push($this->general('You must pay 999 pesos.'));
        $first = $this->postJson('/help', ['question' => 'Explain waste segregation.'])->assertOk();
        self::assertStringNotContainsString('999', $first->json('reply.content'));
        self::assertSame('degraded', $first->json('reply.status'));
        $second = $this->postJson('/help', ['question' => 'How much does it cost?'])->assertOk();
        self::assertStringNotContainsString('999', $second->json('reply.content'));
    }

    public function test_provider_authentication_errors_are_not_retried_or_exposed(): void
    {
        Http::fake(['*' => Http::response(['error' => ['message' => 'SECRET_PROVIDER_DETAILS']], 403)]);
        $response = $this->postJson('/help', ['question' => 'How do I prepare for community work?'])->assertStatus(503);
        self::assertStringNotContainsString('SECRET_PROVIDER_DETAILS', $response->getContent());
        Http::assertSentCount(1);
    }

    public function test_transient_provider_failures_retry_once_and_published_records_still_work(): void
    {
        $this->item();
        Http::fakeSequence()->push([], 503)->push([], 503);
        $this->postJson('/help', ['question' => 'Explain waste segregation.'])->assertOk()
            ->assertJsonPath('reply.status', 'degraded')->assertJsonPath('reply.basis', 'barangay')
            ->assertJsonCount(1, 'reply.sources');
        Http::assertSentCount(2);
    }

    public function test_rate_limits_and_safety_blocks_have_distinct_notices(): void
    {
        Http::fakeSequence()->push([], 429, ['Retry-After' => '30'])
            ->push(['promptFeedback' => ['blockReason' => 'SAFETY']]);
        $limited = $this->postJson('/help', ['question' => 'What are community programs?'])->assertStatus(503);
        self::assertStringContainsString('busy', $limited->json('reply.notice'));
        $blocked = $this->postJson('/help', ['question' => 'Please explain community programs.'])->assertStatus(503);
        self::assertStringContainsString('safe, complete answer', $blocked->json('reply.notice'));
        Http::assertSentCount(2);
    }

    public function test_connection_failures_use_sanitized_logs_and_safe_fallbacks(): void
    {
        Log::spy();
        Http::fake(fn () => throw new ConnectionException('SECRET_CONNECTION_DETAILS'));
        $this->postJson('/help', ['question' => 'What are the fees?'])->assertOk()->assertJsonPath('reply.status', 'degraded');
        Log::shouldHaveReceived('warning')->withArgs(fn ($message, $context): bool => $context['reason'] === 'connection'
            && ! str_contains(json_encode([$message, $context]), 'SECRET_'))->once();
    }

    public function test_retrieval_failure_is_distinct_from_empty_retrieval(): void
    {
        $this->mock(BarangayHelpKnowledge::class, function ($mock) {
            $mock->shouldReceive('normalize')->andReturn('what are the fees');
            $mock->shouldReceive('retrieve')->andThrow(new \PDOException('SECRET_DATABASE_DETAILS'));
            $mock->shouldReceive('isFilipino')->andReturn(false);
            $mock->shouldReceive('facet')->andReturn('fee');
        });
        $response = $this->postJson('/help', ['question' => 'What are the fees?'])->assertOk()
            ->assertJsonPath('reply.status', 'degraded');
        self::assertStringContainsString('records are temporarily unreachable', $response->json('reply.notice'));
        self::assertStringNotContainsString('SECRET_DATABASE_DETAILS', $response->getContent());
        Http::assertNothingSent();
    }

    public function test_conversations_expire_and_are_isolated_by_resident_and_barangay(): void
    {
        $this->postJson('/help', ['question' => 'hello'])->assertOk();
        $firstResident = $this->resident;
        $this->actingAs($this->resident());
        $this->get('/help')->assertInertia(fn ($page) => $page->has('messages', 0));
        $this->actingAs($firstResident);
        $firstResident->barangay_id = (string) Str::uuid();
        $this->get('/help')->assertInertia(fn ($page) => $page->has('messages', 0));
        $firstResident->barangay_id = $this->barangayId;
        $this->travel(31)->minutes();
        $this->get('/help')->assertInertia(fn ($page) => $page->has('messages', 0));
    }

    public function test_clear_and_idempotent_retries_do_not_duplicate_or_leak_messages(): void
    {
        $id = (string) Str::uuid();
        $this->postJson('/help', ['question' => 'hello', 'request_id' => $id])->assertJsonCount(2, 'messages');
        $this->postJson('/help', ['question' => 'hello', 'request_id' => $id])->assertJsonCount(2, 'messages');
        $this->deleteJson('/help')->assertOk()->assertJsonPath('messages', []);
        $this->get('/help')->assertInertia(fn ($page) => $page->has('messages', 0));
    }

    public function test_conversation_history_has_a_fixed_bound(): void
    {
        for ($index = 0; $index < 8; $index++) {
            $response = $this->postJson('/help', ['question' => 'hello'])->assertOk();
        }
        self::assertCount(12, $response->json('messages'));
    }

    public function test_validation_verification_and_role_guards_remain_in_force(): void
    {
        $this->postJson('/help', ['question' => str_repeat('a', 1001)])->assertUnprocessable();
        $this->resident->setRelation('residentProfile', (new ResidentProfile)->forceFill(['verification_status' => 'pending']));
        $this->postJson('/help', ['question' => 'hello'])->assertForbidden();
        $this->resident->role = 'admin';
        $this->postJson('/help', ['question' => 'hello'])->assertForbidden();
    }

    public function test_unauthenticated_requests_require_login(): void
    {
        auth()->forgetGuards();
        $this->postJson('/help', ['question' => 'hello'])->assertUnauthorized();
    }

    public function test_database_errors_before_the_controller_do_not_expose_debug_details(): void
    {
        $request = Request::create('/help', 'POST', server: ['HTTP_ACCEPT' => 'application/json']);
        $exception = new QueryException('mysql', 'select SECRET_PRIVATE_DATA', [], new \PDOException('SECRET_CREDENTIALS'));
        $response = app(ExceptionHandler::class)->render($request, $exception);
        self::assertSame(503, $response->getStatusCode());
        self::assertStringNotContainsString('SECRET_', $response->getContent());
        $html = app(ExceptionHandler::class)->render(Request::create('/help'), $exception);
        self::assertSame(503, $html->getStatusCode());
        self::assertStringNotContainsString('SECRET_', $html->getContent());
    }

    public function test_published_supporting_document_requirements_take_priority_over_form_fields(): void
    {
        DocumentTemplate::create(['barangay_id' => $this->barangayId, 'key' => 'barangay_clearance', 'name' => 'Barangay Clearance', 'resident_fields' => ['purpose']]);
        $item = $this->item(['title' => 'Clearance supporting documents', 'content' => 'Bring the supporting documents listed in the published application guide.']);
        Http::fake(['*' => Http::response($this->candidate([
            'kind' => 'answer', 'evidence' => [['source_id' => 'library:'.$item->id, 'quote' => $item->content]], 'guidance' => '',
        ]))]);
        $response = $this->postJson('/help', ['question' => 'What documents are required for clearance?'])
            ->assertOk()->assertJsonPath('reply.sources.0.id', 'library:'.$item->id);
        self::assertStringNotContainsString('Online request form fields', $response->json('reply.content'));
        Http::assertSentCount(1);
    }

    public function test_online_catalog_lists_only_the_current_barangays_enabled_forms(): void
    {
        foreach ([
            ['key' => 'local', 'name' => 'Published local form'],
            ['key' => 'disabled', 'name' => 'SECRET_DISABLED_FORM', 'is_enabled' => false],
            ['key' => 'other', 'name' => 'SECRET_OTHER_FORM', 'barangay_id' => (string) Str::uuid()],
        ] as $attributes) {
            DocumentTemplate::create(array_merge(['barangay_id' => $this->barangayId, 'resident_fields' => ['purpose']], $attributes));
        }
        $response = $this->postJson('/help', ['question' => 'What can I request online?'])->assertOk()->assertJsonPath('reply.basis', 'barangay');
        self::assertStringContainsString('Published local form', $response->json('reply.content'));
        self::assertStringNotContainsString('SECRET_', $response->getContent());
        Http::assertNothingSent();
    }

    public function test_retry_replaces_the_last_failed_exchange_instead_of_duplicating_it(): void
    {
        Http::fakeSequence()->push([], 503)->push([], 503)->push($this->general());
        $this->postJson('/help', ['question' => 'How can I prepare for community work?'])->assertStatus(503)->assertJsonCount(2, 'messages');
        $this->postJson('/help', ['question' => 'How can I prepare for community work?', 'retry' => true])
            ->assertOk()->assertJsonCount(2, 'messages')->assertJsonPath('reply.status', 'answered');
    }

    public function test_empty_or_malformed_success_responses_are_reported_as_provider_problems(): void
    {
        Http::fakeSequence()->push(['candidates' => []])->push(['candidates' => [[
            'finishReason' => 'STOP', 'content' => ['parts' => [['text' => '{malformed JSON']]],
        ]]]);
        foreach (['What are community programs?', 'How do I join a community program?'] as $question) {
            $this->postJson('/help', ['question' => $question])->assertStatus(503)
                ->assertJsonPath('reply.status', 'unavailable')->assertJsonPath('reply.basis', 'general');
        }
    }

    public function test_the_resident_question_rate_limit_is_still_enforced(): void
    {
        for ($index = 0; $index < 10; $index++) {
            $this->postJson('/help', ['question' => 'hello'])->assertOk();
        }
        $this->postJson('/help', ['question' => 'hello'])->assertStatus(429);
    }

    public function test_a_short_filipino_follow_up_uses_the_latest_topic_not_an_older_document_topic(): void
    {
        DocumentTemplate::create(['barangay_id' => $this->barangayId, 'key' => 'barangay_clearance', 'name' => 'Barangay Clearance', 'resident_fields' => ['purpose']]);
        $this->item(['title' => 'Document requirements', 'content' => 'Clearance supporting documents should be confirmed with staff.']);
        Http::fake(['*' => Http::response($this->general('Magdala ng walis at gloves kung maaari, at kumpirmahin ang detalye sa organizers.'))]);
        $this->postJson('/help', ['question' => 'What can I request online?'])->assertOk();
        $this->postJson('/help', ['question' => 'Paano po maghanda para sa community clean-up?'])->assertOk();
        $this->postJson('/help', ['question' => 'Ano po ang dapat dalhin para doon?'])->assertOk();
        $requests = Http::recorded();
        $contents = $requests[1][0]['contents'];
        $current = json_decode($contents[count($contents) - 1]['parts'][0]['text'], true);
        self::assertSame('Paano po maghanda para sa community clean-up?', $current['current_topic']);
        self::assertSame([], $current['public_sources']);
    }

    public function test_cached_browser_pages_can_refresh_the_canonical_session_history(): void
    {
        $this->postJson('/help', ['question' => 'hello'])->assertOk();
        $this->getJson('/help')->assertOk()->assertJsonCount(2, 'messages')
            ->assertJsonStructure(['messages', 'csrfToken']);
        $this->deleteJson('/help')->assertOk();
        $this->getJson('/help')->assertOk()->assertJsonPath('messages', []);
    }
}
