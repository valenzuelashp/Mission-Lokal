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

class SendMissionAssignmentSms implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $missionId;

    public function __construct(string $missionId)
    {
        $this->missionId = $missionId;
    }

    // Laravel automatically injects whatever SMS Gateway we bound in the AppServiceProvider
    public function handle(SmsGatewayInterface $smsGateway): void
    {
        $mission = Mission::with(['concern', 'assignee', 'barangay'])->find($this->missionId);

        if (!$mission || !$mission->assignee || !$mission->assignee->mobile) {
            Log::warning("Could not send SMS for Mission {$this->missionId}: Missing assignee or mobile number.");
            return;
        }

        $mobile = $mission->assignee->mobile;
        $location = $mission->concern->address_text ?? $mission->barangay->name ?? 'the barangay';
        $title = $mission->concern->title;
        $dueDate = $mission->due_date ? $mission->due_date->format('M d, Y') : 'ASAP';
        
        $appUrl = config('app.url') . '/personnel/missions/' . $mission->id;

        // The exact template from Blueprint Section 9
        $message = "Mission-Lokal: New assignment near {$location}. Issue: {$title}. Due: {$dueDate}. Open app: {$appUrl}";

        $smsGateway->send($mobile, $message);
    }
}