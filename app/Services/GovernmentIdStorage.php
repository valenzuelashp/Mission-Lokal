<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GovernmentIdStorage
{
    public function storeEncrypted(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension() ?: 'bin';
        $cleanName = time() . '_' . Str::random(10) . '.' . $extension . '.enc';
        $path = 'government_ids/' . $cleanName;

        Storage::disk('local')->put(
            $path,
            Crypt::encrypt(file_get_contents($file->getRealPath()))
        );

        return $path;
    }
}
