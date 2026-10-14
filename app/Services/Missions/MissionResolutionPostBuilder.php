<?php

namespace App\Services\Missions;

use App\Models\Concern;
use App\Models\Mission;

class MissionResolutionPostBuilder
{
    public function build(Mission $mission, Concern $concern): array
    {
        $personnel = $mission->personnel->map(function ($member) {
            $name = trim(($member->user?->first_name ?? '').' '.($member->user?->last_name ?? ''));
            $category = $member->category;
            $categoryLabel = is_object($category) && method_exists($category, 'label')
                ? $category->label()
                : (is_string($category) ? ucwords(str_replace('_', ' ', $category)) : null);

            return trim($name.($categoryLabel ? ' ('.$categoryLabel.')' : ''));
        })->filter()->implode(', ');

        $steps = $mission->checklistItems
            ->sortBy('step_order')
            ->pluck('description')
            ->map(fn ($description) => '- '.$description)
            ->implode("\n");

        $start = $mission->assignments->sortBy('assigned_at')->first()?->assigned_at ?? $mission->created_at;
        $end = $mission->completed_at ?? now();
        $elapsedMinutes = max(1, (int) $start->diffInMinutes($end));
        $elapsedHours = intdiv($elapsedMinutes, 60);
        if ($elapsedHours >= 24) {
            $days = intdiv($elapsedHours, 24);
            $hours = $elapsedHours % 24;
            $duration = $days.' day'.($days === 1 ? '' : 's');
            if ($hours > 0) {
                $duration .= ' '.$hours.' hour'.($hours === 1 ? '' : 's');
            }
        } elseif ($elapsedHours > 0) {
            $minutes = $elapsedMinutes % 60;
            $duration = $elapsedHours.' hour'.($elapsedHours === 1 ? '' : 's');
            if ($minutes > 0) {
                $duration .= ' '.$minutes.' minute'.($minutes === 1 ? '' : 's');
            }
        } else {
            $duration = $elapsedMinutes.' minute'.($elapsedMinutes === 1 ? '' : 's');
        }
        $location = $concern->public_location ?? $concern->address_text ?? 'the reported location';

        return [
            'title' => 'Resolved: '.$concern->title,
            'body' => implode("\n\n", array_filter([
                'Barangay personnel completed the reported work, and an administrator verified the result.',
                'Issue: '.$concern->title,
                'Location: '.$location,
                'Personnel: '.($personnel !== '' ? $personnel : 'Barangay field personnel'),
                "Work completed:\n".($steps !== '' ? $steps : '- Completed the assigned corrective action.'),
                'Time from assignment to completion: '.$duration.'.',
                'Verified on: '.now()->format('M d, Y g:i A').'.',
            ])),
            'media_ids' => $mission->proof?->media->sortBy('created_at')->pluck('id')->values()->all() ?? [],
        ];
    }
}