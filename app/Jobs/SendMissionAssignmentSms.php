<?php

namespace App\Jobs;

use App\Models\Mission;
use App\Models\MissionAssignment;
use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMissionAssignmentSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $missionId,
        public string $personnelId,
    ) {
    }

    public function handle(SmsGatewayInterface $smsGateway): bool
    {
        try {
            $mission = Mission::with(['concern', 'barangay', 'personnel.user'])->find($this->missionId);
            $personnel = $mission?->personnel->firstWhere('id', $this->personnelId);

            if (!$mission || !$personnel) {
                Log::warning("Could not send SMS for Mission {$this->missionId}: Personnel {$this->personnelId} is no longer assigned.");
                return false;
            }

            if (!$personnel->sms_enabled) {
                Log::info("Skipping mission SMS for Personnel {$this->personnelId}: SMS is disabled.");
                return false;
            }

            $mobile = $personnel->user?->mobile;
            if (!$mobile) {
                Log::warning("Could not send SMS for Mission {$this->missionId}: Personnel {$this->personnelId} has no mobile number.");
                return false;
            }

            $location = $mission->concern?->locationLabel() ?? $mission->barangay?->name ?? 'the barangay';
            $title = $mission->concern?->title ?? 'a reported issue';
            $dueDate = $mission->due_date ? $mission->due_date->format('M d, Y') : 'ASAP';

            $firstName = trim((string) $personnel->user?->first_name);
            $greeting = $firstName !== '' ? "Hi {$firstName},\n" : '';
            $message = "{$greeting}Mission-Lokal: New assignment\nLocation: {$location}\nIssue: {$title}\nDue: {$dueDate}.";

            if (!$smsGateway->send($mobile, $message)) {
                return false;
            }

            MissionAssignment::where('mission_id', $mission->id)
                ->where('personnel_id', $personnel->user_id)
                ->whereNull('unassigned_at')
                ->latest('assigned_at')
                ->first()
                ?->update(['sms_sent_at' => now()]);

            return true;
        } catch (\Throwable $e) {
            // Log the SMS error without crashing the dispatch request or admin workflow
            Log::error("SMS notification failed for Mission {$this->missionId} / Personnel {$this->personnelId}: " . $e->getMessage());

            return false;
        }
    }
}