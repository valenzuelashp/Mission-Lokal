<?php

namespace App\Support;

use App\Models\Concern;
use App\Models\ConcernAiAnalysis;
use App\Models\ConcernStatusHistory;
use Carbon\CarbonInterface;

class ConcernStatusUpdate
{
    public static function record(
        Concern $concern,
        ?string $fromStatus,
        string $toStatus,
        ?string $actorId,
        ?string $note = null,
    ): ConcernStatusHistory {
        return ConcernStatusHistory::create([
            'concern_id' => $concern->id,
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'actor_id' => $actorId,
            'note' => $note,
        ]);
    }

    public static function label(string $status): string
    {
        return match ($status) {
            'submitted' => 'Concern received',
            'ai_processed' => 'Initial triage complete',
            'under_review' => 'Verified by barangay',
            'active' => 'Approved · mission created',
            'resolved' => 'Resolved',
            'rejected', 'spam' => 'Rejected',
            'closed' => 'Closed',
            default => ucwords(str_replace('_', ' ', $status)),
        };
    }

    public static function message(string $status, ?string $note = null, ?string $closedSummary = null): string
    {
        return match ($status) {
            'submitted' => '',
            'ai_processed' => '',
            'under_review' => 'The barangay has verified this concern and is reviewing it for action.',
            'active' => 'The barangay approved this report and created a mission to address it.',
            'resolved' => self::resolutionMessage($note),
            'rejected', 'spam' => self::rejectionMessage($note, $closedSummary),
            'closed' => 'The barangay has closed this concern.',
            default => 'The concern status has been updated to ' . strtolower(self::label($status)) . '.',
        };
    }

    public static function isResidentDecision(
        string $status,
        ?string $note = null,
        ?string $closedSummary = null,
        bool $missionCreated = false,
    ): bool {
        return ($status === 'active' && $missionCreated)
            || (in_array($status, ['rejected', 'spam'], true) && self::hasRejectionReason($note, $closedSummary));
    }

    public static function isResidentUpdate(
        string $status,
        ?string $note = null,
        ?string $closedSummary = null,
        bool $missionCreated = false,
    ): bool {
        return (($status === 'active' && $missionCreated) || in_array($status, ['resolved', 'closed'], true))
            || (in_array($status, ['rejected', 'spam'], true) && self::hasRejectionReason($note, $closedSummary));
    }

    public static function plan(?ConcernAiAnalysis $analysis): array
    {
        $suggestedSteps = $analysis?->prescriptive_steps;
        $steps = array_values(array_filter(
            is_array($suggestedSteps) ? $suggestedSteps : [],
            fn ($step) => is_string($step) && trim($step) !== '',
        ));

        $durationHours = $analysis?->suggested_duration_hours;
        $duration = $durationHours !== null
            ? self::formatEstimatedDuration((int) $durationHours)
            : null;

        return [
            'prescriptive_steps' => $steps,
            'estimated_duration' => $duration,
            'estimated_completion' => $analysis?->suggested_due_date?->format('M j, Y'),
        ];
    }

    public static function resolutionNote(Concern $concern): string
    {
        $duration = $concern->created_at
            ? self::formatDuration($concern->created_at, now())
            : null;

        return 'Barangay verified the completed mission.'
            . ($duration ? ' Total resolution time: ' . $duration . '.' : '');
    }

    private static function resolutionMessage(?string $note): string
    {
        if (preg_match('/Total resolution time:\s*(.+?)(?:\.|$)/i', (string) $note, $matches)) {
            return 'The barangay resolved this concern in ' . trim($matches[1]) . '.';
        }

        return 'The barangay has resolved this concern.';
    }

    private static function formatDuration(CarbonInterface $start, CarbonInterface $end): string
    {
        $minutes = max(0, (int) $start->diffInMinutes($end));
        if ($minutes < 60) {
            return $minutes . ' ' . ($minutes === 1 ? 'minute' : 'minutes');
        }

        $hours = intdiv($minutes, 60);
        $days = intdiv($hours, 24);
        $hours %= 24;
        $parts = [];

        if ($days > 0) {
            $parts[] = $days . ' ' . ($days === 1 ? 'day' : 'days');
        }
        if ($hours > 0) {
            $parts[] = $hours . ' ' . ($hours === 1 ? 'hour' : 'hours');
        }

        return implode(' and ', $parts);
    }

    private static function formatEstimatedDuration(int $hours): string
    {
        if ($hours < 24) {
            return $hours . ' ' . ($hours === 1 ? 'hour' : 'hours');
        }

        $days = intdiv($hours, 24);
        $remainingHours = $hours % 24;
        $duration = 'about ' . $days . ' ' . ($days === 1 ? 'day' : 'days');

        if ($remainingHours > 0) {
            $duration .= ' and ' . $remainingHours . ' ' . ($remainingHours === 1 ? 'hour' : 'hours');
        }

        return $duration . ' (' . $hours . ' hours)';
    }

    private static function rejectionMessage(?string $note, ?string $closedSummary): string
    {
        $reason = self::rejectionReason($note, $closedSummary);

        return $reason !== ''
            ? 'The barangay rejected this concern. Reason: ' . $reason
            : 'The barangay rejected this concern.';
    }

    private static function hasRejectionReason(?string $note, ?string $closedSummary): bool
    {
        return self::rejectionReason($note, $closedSummary) !== '';
    }

    private static function rejectionReason(?string $note, ?string $closedSummary): string
    {
        $trimmedNote = trim((string) $note);
        $reason = preg_replace(
            '/^(?:dismissed\/rejected|rejected):\s*/i',
            '',
            $trimmedNote,
        );
        $reason = trim($reason ?? '');

        if (
            $reason === ''
            || $reason === $trimmedNote
            || strcasecmp($reason, 'Admin status update: rejected') === 0
            || strcasecmp($reason, 'Rejected by administrator') === 0
            || strcasecmp($reason, 'Dismissed by admin review.') === 0
        ) {
            $reason = trim((string) $closedSummary);
        }

        if (in_array(strtolower($reason), [
            'admin status update: rejected',
            'rejected by administrator',
            'dismissed by admin review.',
        ], true)) {
            return '';
        }

        return $reason;
    }
}