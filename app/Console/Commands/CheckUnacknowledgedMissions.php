<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Mission;
use App\Models\Notification;
use App\Models\BarangaySetting;
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
        $missions = Mission::where('status', 'assigned')
            ->where('is_escalated', false)
            ->get();

        $escalatedCount = 0;

        foreach ($missions as $mission) {
            // Get the specific barangay's timeout, or default to 4
            $timeoutHours = $settings->get($mission->barangay_id)?->ack_timeout_hours ?? 4;

            // 3. Check if the time since assignment exceeds the timeout limit
            if ($mission->created_at->addHours($timeoutHours)->isPast()) {
                
                DB::transaction(function () use ($mission, $timeoutHours) {
                    // Mark as escalated so we don't notify the admin repeatedly
                    $mission->update(['is_escalated' => true]);

                    // Send the notification to the admin who created the mission
                    Notification::create([
                        'user_id' => $mission->created_by,
                        'channel' => 'in_app',
                        'event_type' => 'mission_escalated',
                        'title' => 'Mission Unacknowledged',
                        'body' => 'Mission ' . substr($mission->id, 0, 8) . ' has been unacknowledged for over ' . $timeoutHours . ' hours.',
                        'payload' => ['mission_id' => $mission->id],
                    ]);
                });

                $escalatedCount++;
            }
        }

        $this->info("Checked missions. Escalated: {$escalatedCount}");
    }
}