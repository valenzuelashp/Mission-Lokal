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
        $this->deleteStoredPhoto($user->profile_photo_path);

        $path = $request->file('photo')->store('profile-photos', 'public');
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
