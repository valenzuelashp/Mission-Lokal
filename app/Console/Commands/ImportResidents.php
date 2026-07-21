<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ImportResidents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'residents:import 
                            {file : Path to the CSV file relative to storage or absolute path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import preloaded residents from a municipal CSV file into the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        // Resolve path if given relative to storage/app
        if (!file_exists($filePath)) {
            $storagePath = storage_path('app/' . $filePath);
            if (file_exists($storagePath)) {
                $filePath = $storagePath;
            } else {
                $this->error("The specified CSV file could not be found at: {$filePath}");
                return 1;
            }
        }

        $this->info("Opening CSV file: {$filePath}");

        if (($handle = fopen($filePath, 'r')) === false) {
            $this->error("Failed to open the CSV file.");
            return 1;
        }

        // Read header row
        $header = fgetcsv($handle);
        if (!$header) {
            $this->error("The CSV file is empty.");
            fclose($handle);
            return 1;
        }

        // Normalize header keys (lowercase, trim)
        $header = array_map(fn($col) => strtolower(trim($col)), $header);
        
        $requiredColumns = ['account_id', 'first_name', 'last_name', 'birthday'];
        foreach ($requiredColumns as $col) {
            if (!in_array($col, $header)) {
                $this->error("Missing required column in CSV header: '{$col}'");
                fclose($handle);
                return 1;
            }
        }

        $rowNumber = 1;
        $importedCount = 0;
        $skippedCount = 0;

        DB::beginTransaction();

        try {
            while (($data = fgetcsv($handle)) !== false) {
                $rowNumber++;

                // Skip blank rows
                if (count($data) === 1 && empty($data[0])) {
                    continue;
                }

                if (count($header) !== count($data)) {
                    $this->warn("Row {$rowNumber}: Column count mismatch with header. Skipping.");
                    $skippedCount++;
                    continue;
                }

                $row = array_combine($header, $data);

                // Clean up empty strings to null
                $row = array_map(fn($val) => trim($val) === '' ? null : trim($val), $row);

                // Validate row fields
                $validator = Validator::make($row, [
                    'account_id' => ['required', 'string'],
                    'first_name' => ['required', 'string', 'max:255'],
                    'middle_name' => ['nullable', 'string', 'max:255'],
                    'last_name' => ['required', 'string', 'max:255'],
                    'name_extension' => ['nullable', 'string', 'max:50'],
                    'birthday' => ['required', 'date'],
                    'address' => ['nullable', 'string'],
                    'mobile' => ['nullable', 'string', 'max:50'],
                ]);

                if ($validator->fails()) {
                    $this->warn("Row {$rowNumber} validation failed for account_id: " . ($row['account_id'] ?? 'UNKNOWN'));
                    foreach ($validator->errors()->all() as $error) {
                        $this->line("  - {$error}");
                    }
                    $skippedCount++;
                    continue;
                }

                // Upsert into preloaded_residents table
                DB::table('preloaded_residents')->updateOrInsert(
                    ['account_id' => $row['account_id']],
                    [
                        'first_name' => $row['first_name'],
                        'middle_name' => $row['middle_name'] ?? null,
                        'last_name' => $row['last_name'],
                        'name_extension' => $row['name_extension'] ?? null,
                        'birthday' => Carbon::parse($row['birthday'])->format('YYYY-MM-DD') ?? $row['birthday'],
                        'address' => $row['address'] ?? null,
                        'mobile' => $row['mobile'] ?? null,
                        'updated_at' => now(),
                        'created_at' => DB::raw('COALESCE(created_at, NOW())'),
                    ]
                );

                $importedCount++;
            }

            fclose($handle);
            DB::commit();

            $this->info("Import completed successfully!");
            $this->line(" - Imported/Updated: {$importedCount} records");
            $this->line(" - Skipped/Failed: {$skippedCount} records");

            return 0;

        } catch (\Exception $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("An error occurred during import: " . $e->getMessage());
            return 1;
        }
    }
}