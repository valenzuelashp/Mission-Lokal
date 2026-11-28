<?php

namespace App\Jobs;

use App\Models\LoginActivity;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class LocateLoginActivity implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;

    public int $timeout = 10;

    public function __construct(public string $activityId) {}

    public function handle(): void
    {
        $activity = LoginActivity::find($this->activityId);
        if (! $activity || ! filter_var($activity->ip_address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return;
        }
        try {
            $location = Cache::remember('login-location:'.hash('sha256', $activity->ip_address), now()->addDay(), function () use ($activity) {
                $data = Http::timeout(4)->get('https://ipwho.is/'.rawurlencode($activity->ip_address))->throw()->json();
                if (($data['success'] ?? false) !== true) {
                    return 'Unknown';
                }

                return mb_substr(implode(', ', array_filter([$data['city'] ?? null, $data['region'] ?? null, $data['country'] ?? null], 'is_string')), 0, 255) ?: 'Unknown';
            });
            $activity->update(['approximate_location' => $location]);
        } catch (\Throwable) {
            // Login remains successful; do not log IPs or provider payloads on lookup failure.
        }
    }
}
