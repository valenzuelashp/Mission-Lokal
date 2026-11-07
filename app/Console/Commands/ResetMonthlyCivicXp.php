<?php

namespace App\Console\Commands;

use App\Models\ResidentProfile;
use App\Services\CivicXpMonthlyRanking;
use Illuminate\Console\Command;

class ResetMonthlyCivicXp extends Command
{
    protected $signature = 'civic-xp:monthly-reset';

    protected $description = 'Reset all resident monthly Civic XP to the 50-point starting balance';

    public function handle(): int
    {
        $closedMonth = now()->startOfMonth()->subMonth()->format('Y-m');
        $snapshotCount = app(CivicXpMonthlyRanking::class)->snapshotMonth($closedMonth);
        $count = ResidentProfile::query()->update(['civic_xp' => 50]);

        $this->info("Archived {$snapshotCount} Civic XP rankings for {$closedMonth}.");
        $this->info("Reset monthly Civic XP to 50 for {$count} resident profiles.");

        return self::SUCCESS;
    }
}