<?php

namespace App\Http\Controllers;

use App\Models\Concern;
use App\Models\ConcernClarification;
use App\Models\Notification;
use App\Models\ConcernReanalysis;
use App\Jobs\Ai\ProcessConcernWithAi;
use App\Services\Concerns\ConcernReanalysisService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConcernClarificationController extends Controller
{
    public function reanalyse(Request $request, Concern $concern): RedirectResponse
    {
        abort_unless($concern->barangay_id === $request->user()->barangay_id, 404);
        abort_unless($request->user()->canModifySystem(), 403);
        $run = DB::transaction(function () use ($request, $concern) {
            $concern = Concern::whereKey($concern->id)->lockForUpdate()->firstOrFail();
            $availability = app(ConcernReanalysisService::class)->availability($concern);
            if (! $availability['can_reanalyse']) {
                throw ValidationException::withMessages(['reanalysis' => 'Reanalysis needs a new resident reply, an open staff review, and no other reanalysis in progress.']);
            }

            return ConcernReanalysis::create([
                'concern_id' => $concern->id, 'requested_by' => $request->user()->id,
                'clarification_ids' => $availability['answered_ids'], 'status' => 'queued',
            ]);
        });
        ProcessConcernWithAi::dispatch($concern, $run->id)->onConnection('database')->afterCommit();

        return back()->with('success', 'Reanalysis queued. Resident replies will be processed locally for privacy.');
    }

    public function store(Request $request, Concern $concern): RedirectResponse
    {
        abort_unless($concern->barangay_id === $request->user()->barangay_id, 404);
        abort_unless($request->user()->canModifySystem(), 403);

        $validated = $request->validate([
            'questions' => ['required', 'array', 'min:1', 'max:5'],
            'questions.*' => ['required', 'string', 'max:500', 'distinct'],
        ]);

        DB::transaction(function () use ($request, $concern, $validated) {
            $concern = Concern::whereKey($concern->id)->lockForUpdate()->firstOrFail();
            if (! $concern->canRequestClarification()) {
                throw ValidationException::withMessages([
                    'questions' => 'A request can only be sent to the reporter while this concern is awaiting a staff decision and has no unanswered request.',
                ]);
            }

            $clarification = $concern->clarifications()->create([
                'requested_by' => $request->user()->id,
                'questions' => array_values($validated['questions']),
            ]);

            Notification::create([
                'user_id' => $concern->reporter_id,
                'channel' => 'in_app',
                'event_type' => 'concern_clarification_requested',
                'title' => 'More details requested',
                'body' => 'Barangay staff have questions about your concern. Open the report to reply privately.',
                'payload' => ['concern_id' => $concern->id, 'clarification_id' => $clarification->id],
                'is_read' => false,
                'sent_at' => now(),
            ]);
        });

        return back()->with('success', 'Your questions were sent to the resident.');
    }

    public function reply(Request $request, Concern $concern, ConcernClarification $clarification): RedirectResponse
    {
        abort_unless($concern->barangay_id === $request->user()->barangay_id, 404);
        abort_unless($concern->reporter_id === $request->user()->id, 403);
        abort_unless($clarification->concern_id === $concern->id, 404);

        $validated = $request->validate(['response' => ['required', 'string', 'max:5000']]);

        DB::transaction(function () use ($concern, $clarification, $validated) {
            $concern = Concern::whereKey($concern->id)->lockForUpdate()->firstOrFail();
            $clarification = $concern->clarifications()->whereKey($clarification->id)->lockForUpdate()->firstOrFail();

            if (! $concern->isAwaitingStaffDecision() || $clarification->answered_at !== null) {
                throw ValidationException::withMessages([
                    'response' => 'This request has already been answered or the concern is no longer awaiting a staff decision.',
                ]);
            }

            $clarification->update(['response' => $validated['response'], 'answered_at' => now()]);

            if ($clarification->requested_by) {
                Notification::create([
                    'user_id' => $clarification->requested_by,
                    'channel' => 'in_app',
                    'event_type' => 'concern_clarification_answered',
                    'title' => 'Resident replied to your questions',
                    'body' => 'Additional details are ready for your review in the concern record.',
                    'payload' => ['concern_id' => $concern->id, 'clarification_id' => $clarification->id],
                    'is_read' => false,
                    'sent_at' => now(),
                ]);
            }
        });

        return back()->with('success', 'Your reply was sent to barangay staff.');
    }
}
