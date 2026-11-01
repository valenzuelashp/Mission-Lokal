<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

return new class extends Migration
{
    public function up(): void
    {
        $concerns = DB::table('concerns')
            ->select(['id', 'category_id', 'subcategory_id', 'visibility', 'is_blotter_candidate', 'title', 'description'])
            ->orderBy('id');

        $concerns->chunk(200, function ($records) {
            foreach ($records as $concern) {
                $legacyVawcSelection = (int) $concern->category_id === 4
                    && $concern->visibility === 'private'
                    && (bool) $concern->is_blotter_candidate;
                $vawc = (int) $concern->subcategory_id === 6
                    || $legacyVawcSelection
                    || preg_match(
                        '/\b(vawc|violence\s+against\s+women|domestic\s+(?:violence|dispute)|ra\s*9262)\b/i',
                        ($concern->title ?? '').' '.($concern->description ?? '')
                    ) === 1;

                if ($vawc) {
                    DB::table('concerns')->where('id', $concern->id)->update([
                        'category_id' => 3,
                        'subcategory_id' => 6,
                        'visibility' => 'private',
                        'is_blotter_candidate' => true,
                        'address_text' => null,
                    ]);
                }
            }
        });

        DB::table('mission_resolution_posts')
            ->whereIn('mission_id', function ($query) {
                $query->select('missions.id')
                    ->from('missions')
                    ->join('concerns', 'concerns.id', '=', 'missions.concern_id')
                    ->where('concerns.subcategory_id', 6);
            })
            ->update(['is_published' => false, 'published_at' => null]);

        $concernSourcePaths = [];
        DB::table('concern_media')
            ->orderBy('id')
            ->chunk(100, function ($mediaRecords) use (&$concernSourcePaths) {
                foreach ($mediaRecords as $media) {
                    $source = $media->storage_key;
                    if (! Storage::disk('public')->exists($source)) {
                        continue;
                    }

                    $target = 'private/concerns/'.$media->concern_id.'/'.$media->id.'-'.basename(str_replace('\\', '/', $source));
                    $stream = Storage::disk('public')->readStream($source);
                    if (! is_resource($stream)) {
                        throw new RuntimeException("Unable to read sensitive concern media: {$source}");
                    }

                    try {
                        if (! Storage::disk('local')->writeStream($target, $stream)) {
                            throw new RuntimeException("Unable to move sensitive concern media to private storage: {$source}");
                        }
                    } finally {
                        fclose($stream);
                    }

                    DB::table('concern_media')->where('id', $media->id)->update(['storage_key' => $target]);
                    $concernSourcePaths[$source] = true;
                }
            });

        $proofSourcePaths = [];
        DB::table('mission_proof_media')
            ->orderBy('id')
            ->chunk(100, function ($mediaRecords) use (&$proofSourcePaths) {
                foreach ($mediaRecords as $media) {
                    $source = $media->storage_key;
                    if (! Storage::disk('public')->exists($source)) {
                        continue;
                    }

                    $target = 'private/proofs/'.$media->proof_id.'/'.$media->id.'-'.basename(str_replace('\\', '/', $source));
                    $stream = Storage::disk('public')->readStream($source);
                    if (! is_resource($stream)) {
                        throw new RuntimeException("Unable to read sensitive mission proof: {$source}");
                    }

                    try {
                        if (! Storage::disk('local')->writeStream($target, $stream)) {
                            throw new RuntimeException("Unable to move sensitive mission proof to private storage: {$source}");
                        }
                    } finally {
                        fclose($stream);
                    }

                    DB::table('mission_proof_media')->where('id', $media->id)->update(['storage_key' => $target]);
                    $proofSourcePaths[$source] = true;
                }
            });

        foreach (array_keys($concernSourcePaths + $proofSourcePaths) as $source) {
            $concernStillReferencesSource = DB::table('concern_media')->where('storage_key', $source)->exists();
            $proofStillReferencesSource = DB::table('mission_proof_media')->where('storage_key', $source)->exists();

            if (! $concernStillReferencesSource && ! $proofStillReferencesSource) {
                Storage::disk('public')->delete($source);
            }
        }
    }

    public function down(): void
    {
        // Sensitive attachments must never be copied back to publicly served storage.
    }
};
