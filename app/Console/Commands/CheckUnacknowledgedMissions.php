<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Mission;
use App\Models\Notification;
use App\Models\BarangaySetting;
use App\Services\Missions\MissionLifecycleService;
use Illuminate\Support\Facades\DB;

class CheckUnacknowledgedMissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'missions:check-unacknowledged';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for assigned missions that have exceeded the barangay acknowledgment timeout.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Fetch all custom timeout settings per barangay (default is 4 hours)
        $settings = BarangaySetting::all()->keyBy('barangay_id');

        // 2. Get all missions that are still 'assigned' and haven't been escalated yet
        $missions = Mission::with('assignments')
            ->whereIn('status', ['assigned', 'acknowledged', 'in_progress'])
            ->where('is_escalated', false)
            ->get();

        $escalatedCount = 0;

        foreach ($missions as $mission) {
            // Get the specific barangay's timeout, or default to 4
            $timeoutHours = $settings->get($mission->barangay_id)?->ack_timeout_hours ?? 4;

            $expiredAssignment = $mission->assignments
                ->whereNull('unassigned_at')
                ->first(function ($assignment) use ($timeoutHours) {
                    return !$assignment->acknowledged_at
                        && $assignment->assigned_at->copy()->addHours($timeoutHours)->isPast();
                });

            $hasAssignmentHistory = $mission->assignments->isNotEmpty();
            $legacyTimeoutExpired = !$hasAssignmentHistory
                && !$mission->acknowledged_at
                && $mission->created_at->copy()->addHours($timeoutHours)->isPast();

            if ($expiredAssignment || $legacyTimeoutExpired) {
                $status = $mission->status->value ?? $mission->status;
                $escalated = DB::transaction(function () use ($mission, $status, $timeoutHours) {
                    $updated = Mission::whereKey($mission->id)
                        ->where('is_escalated', false)
                        ->update(['is_escalated' => true]);

                    if (!$updated) {
                        return false;
                    }

                    app(MissionLifecycleService::class)->recordStatusChange(
                        $mission,
                        $status,
                        $status,
                        null,
                        'Escalated after an active personnel assignment exceeded its acknowledgment timeout.',
                    );

                    Notification::notifyBarangayAdmins(
                        $mission->barangay_id,
                        'mission_escalated',
                        'Mission Unacknowledged',
                        'Mission ' . substr($mission->id, 0, 8) . ' exceeded its ' . $timeoutHours . '-hour acknowledgment window.',
                        ['mission_id' => $mission->id],
                    );

                    return true;
                });

                if (!$escalated) {
                    continue;
                }

                $escalatedCount++;
            }
        }

        $this->info("Checked missions. Escalated: {$escalatedCount}");
    }
}