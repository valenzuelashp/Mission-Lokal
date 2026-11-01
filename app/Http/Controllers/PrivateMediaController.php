<?php

namespace App\Http\Controllers;

use App\Models\ConcernMedia;
use App\Models\MissionProofMedia;
use App\Services\SensitiveMediaAccess;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PrivateMediaController extends Controller
{
    public function concern(ConcernMedia $media): StreamedResponse
    {
        $concern = $media->concern()->with('subcategory')->firstOrFail();
        abort_unless(app(SensitiveMediaAccess::class)->canViewConcern(request()->user(), $concern), 404);

        return $this->stream($media->storage_key, $media->mime_type);
    }

    public function proof(MissionProofMedia $media): StreamedResponse
    {
        $proof = $media->proof()->with('mission.concern.subcategory')->firstOrFail();
        $concern = $proof->mission?->concern;
        abort_unless($concern && app(SensitiveMediaAccess::class)->canViewConcern(request()->user(), $concern), 404);

        return $this->stream($media->storage_key, $media->mime_type);
    }

    private function stream(string $path, ?string $mimeType): StreamedResponse
    {
        $disk = Storage::disk('local');
        abort_unless($disk->exists($path), 404);

        $stream = $disk->readStream($path);
        abort_unless(is_resource($stream), 404);

        $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        $contentType = in_array($mimeType, $allowedMimeTypes, true) ? $mimeType : 'application/octet-stream';

        return response()->stream(function () use ($stream) {
            try {
                fpassthru($stream);
            } finally {
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $contentType,
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'Referrer-Policy' => 'no-referrer',
            'Content-Security-Policy' => "default-src 'none'; sandbox",
        ]);
    }
}
