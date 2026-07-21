<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Mission;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- ACK Timeout Escalation Task (Default 4 Hours) ---
Schedule::call(function () {
    $cutoff = Carbon::now()->subHours(4);

    $unacknowledgedMissions = Mission::where('status', 'assigned')
        ->whereNull('acknowledged_at')
        ->where('created_at', '<=', $cutoff)
        ->where('is_escalated', false)
        ->get();

    foreach ($unacknowledgedMissions as $mission) {
        // 1. Mark mission as escalated
        $mission->update([
            'is_escalated' => true,
        ]);

        // 2. Alert admins within the same barangay
        $admins = User::where('barangay_id', $mission->barangay_id)
            ->whereIn('role', ['admin', 'super_admin'])
            ->get();

        foreach ($admins as $admin) {
            Notification::create([
                'id' => \Illuminate\Support\Str::uuid(),
                'user_id' => $admin->id,
                'channel' => 'in_app',
                'event_type' => 'mission_escalated',
                'title' => 'Mission Escalated: ACK Timeout Exceeded',
                'body' => "Mission {$mission->id} has not been acknowledged within 4 hours and requires reassignment.",
                'payload' => json_encode(['mission_id' => $mission->id]),
                'is_read' => false,
                'sent_at' => now(),
            ]);
        }
    }
})->hourly()->name('missions:check-ack-timeout');