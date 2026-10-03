<?php

namespace App\Jobs;

use App\Models\Mission;
use App\Services\Sms\SmsGatewayInterface;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class SendMissionAssignmentSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $missionId,
        public string $personnelId,
    ) {
    }

    public function handle(SmsGatewayInterface $smsGateway): void
    {
        $mission = Mission::with(['concern', 'barangay', 'personnel.user'])->find($this->missionId);
        $personnel = $mission?->personnel->firstWhere('id', $this->personnelId);

        if (!$mission || !$personnel) {
            Log::warning("Could not send SMS for Mission {$this->missionId}: Personnel {$this->personnelId} is no longer assigned.");
            return;
        }

        if (!$personnel->sms_enabled) {
            Log::info("Skipping mission SMS for Personnel {$this->personnelId}: SMS is disabled.");
            return;
        }

        $mobile = $personnel->user?->mobile;
        if (!$mobile) {
            Log::warning("Could not send SMS for Mission {$this->missionId}: Personnel {$this->personnelId} has no mobile number.");
            return;
        }

        $location = $mission->concern?->address_text ?? $mission->barangay?->name ?? 'the barangay';
        $title = $mission->concern?->title ?? 'a reported issue';
        $dueDate = $mission->due_date ? $mission->due_date->format('M d, Y') : 'ASAP';

        $appUrl = config('app.url') . '/personnel/missions/' . $mission->id;

        $message = "Mission-Lokal: New assignment near {$location}. Issue: {$title}. Due: {$dueDate}. Open app: {$appUrl}";

        if (!$smsGateway->send($mobile, $message)) {
            throw new RuntimeException("SMS gateway rejected Mission {$this->missionId} notification for Personnel {$this->personnelId}.");
        }
    }
}