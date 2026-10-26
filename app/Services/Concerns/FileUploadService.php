<?php

namespace App\Services\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadService
{
    protected array $allowedMimes = [
        'image' => ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        'document' => ['application/pdf', 'image/jpeg', 'image/png']
    ];

    /**
     * Execute structured media disk streaming.
     */
    public function upload(UploadedFile $file, string $folder = 'general', string $type = 'image'): string
    {
        $mime = $file->getMimeType();
        $allowed = $this->allowedMimes[$type] ?? $this->allowedMimes['image'];

        if (!in_array($mime, $allowed)) {
            throw new \InvalidArgumentException("Invalid file type classification: {$mime}");
        }

        if ($file->getSize() > 4 * 1024 * 1024) {
            throw new \InvalidArgumentException("File package boundaries exceed maximum 4MB capacity parameters.");
        }

        $extension = $file->getClientOriginalExtension();
        $cleanName = time() . '_' . Str::random(10) . '.' . $extension;

        $source = $file->getRealPath() ?: $file->getPathname();
        $bytes = ($source !== '' && $source !== false) ? file_get_contents($source) : false;
        if ($bytes === false) {
            throw new \InvalidArgumentException('The uploaded file could not be read.');
        }

        // ID documents stay on the private local disk. Photos stay on the public disk.
        $disk = ($type === 'document') ? 'local' : 'public';
        $path = trim($folder.'/'.$cleanName, '/');

        if (! Storage::disk($disk)->put($path, $bytes)) {
            throw new \RuntimeException('The uploaded file could not be saved.');
        }

        return $path;
    }

    /**
     * Remove physical assets from storage folders.
     */
    public function delete(?string $pathKey, string $type = 'image'): bool
    {
        $disk = ($type === 'document') ? 'local' : 'public';
        
        if ($pathKey && Storage::disk($disk)->exists($pathKey)) {
            return Storage::disk($disk)->delete($pathKey);
        }
        return false;
    }
}