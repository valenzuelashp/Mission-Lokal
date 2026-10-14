<?php

namespace App\Jobs;

use App\Models\Mission;
use App\Models\Notification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckOverdueMissions implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        Mission::query()
            ->where('is_overdue', false)
            ->whereNotIn('status', ['completed', 'verified', 'cancelled'])
            ->whereNotNull('due_date')
            ->whereDate('due_date', '<', now()->toDateString())
            ->orderBy('id')
            ->chunkById(100, function ($missions): void {
                foreach ($missions as $mission) {
                    $mission->update(['is_overdue' => true]);
                    $concernTitle = $mission->concern?->title ?? 'Mission';

                    Notification::notifyBarangayAdmins(
                        $mission->barangay_id,
                        'mission_overdue',
                        'Mission Overdue: RA 11032 Deadline Exceeded',
                        "{$concernTitle} (MS-".strtoupper(substr($mission->id, 0, 4)).') has passed its resolution deadline.',
                        ['mission_id' => $mission->id, 'concern_id' => $mission->concern_id],
                    );
                }
            });
    }
}