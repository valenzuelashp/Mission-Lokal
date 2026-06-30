<?php

namespace App\Jobs\Ai;

use App\Models\Concern;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessConcernWithAi implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Concern $concern
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("AI Job Started for Concern ID: {$this->concern->id}");

        // TODO: 1. Send $this->concern->description to the AI LLM
        // TODO: 2. Ask AI to determine: category, subcategory, priority, and if it should be private
        // TODO: 3. Update the database with the AI's findings
        
        $this->concern->update([
            'ai_processed_at' => now(),
        ]);

        Log::info("AI Job Completed for Concern ID: {$this->concern->id}");
    }
}