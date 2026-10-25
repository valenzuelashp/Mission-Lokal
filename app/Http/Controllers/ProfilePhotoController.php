<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfilePhotoController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $photo = $request->file('photo');
        $source = $photo->getRealPath() ?: $photo->getPathname();
        $bytes = ($source !== '' && $source !== false) ? file_get_contents($source) : false;

        if ($bytes === false) {
            return back()->withErrors([
                'photo' => 'That picture did not upload. Choose a JPG, PNG, or WebP under 2 MB.',
            ]);
        }

        $this->deleteStoredPhoto($user->profile_photo_path);

        $path = 'profile-photos/'.$photo->hashName();
        if (! Storage::disk('public')->put($path, $bytes)) {
            return back()->withErrors([
                'photo' => 'The picture could not be saved.',
            ]);
        }

        $user->update(['profile_photo_path' => $path]);

        return back()->with('success', 'Profile picture saved.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = $request->user();
        $this->deleteStoredPhoto($user->profile_photo_path);
        $user->update(['profile_photo_path' => null]);

        return back()->with('success', 'Profile picture removed.');
    }

    private function deleteStoredPhoto(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
