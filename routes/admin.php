<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Admin routes (Blueprint §7.3)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/', fn () => Inertia::render('Admin/Dashboard'))->name('dashboard');
    Route::get('/map', fn () => Inertia::render('Admin/Map'))->name('map');
    Route::get('/reports', fn () => Inertia::render('Admin/Reports/Index'))->name('reports.index');
    Route::get('/reports/{concern}', fn () => Inertia::render('Admin/Reports/Show'))->name('reports.show');
    Route::get('/missions', fn () => Inertia::render('Admin/Missions/Index'))->name('missions.index');
    Route::get('/missions/{mission}', fn (string $mission) => Inertia::render('Admin/Missions/Show', [
        'missionId' => $mission,
    ]))->name('missions.show');
    Route::get('/verifications', fn () => Inertia::render('Admin/Verifications'))->name('verifications');
    Route::get('/profile-edits', fn () => Inertia::render('Admin/ProfileEdits'))->name('profile-edits');
    Route::get('/residents', fn () => Inertia::render('Admin/Residents/Index'))->name('residents.index');
    Route::get('/residents/{user}', fn (string $user) => Inertia::render('Admin/Residents/Show', [
        'residentId' => $user,
    ]))->name('residents.show');
    Route::get('/blotters', fn () => Inertia::render('Admin/Blotters/Index'))->name('blotters.index');
    Route::get('/announcements', fn () => Inertia::render('Admin/Announcements/Index'))->name('announcements.index');
    Route::get('/announcements/create', fn () => Inertia::render('Admin/Announcements/Create'))->name('announcements.create');
    Route::post('/announcements', fn () => redirect()->route('admin.announcements.index')->with('success', 'Announcement saved.'))->name('announcements.store');
    Route::get('/announcements/{announcement}/edit', fn (string $announcement) => Inertia::render('Admin/Announcements/Edit', [
        'announcementId' => $announcement,
    ]))->name('announcements.edit');
    Route::put('/announcements/{announcement}', fn () => redirect()->route('admin.announcements.index')->with('success', 'Announcement updated.'))->name('announcements.update');
    Route::delete('/announcements/{announcement}', fn () => redirect()->route('admin.announcements.index')->with('success', 'Announcement deleted.'))->name('announcements.destroy');
    Route::get('/library', fn () => Inertia::render('Admin/Library/Index'))->name('library.index');
    Route::get('/audit', fn () => Inertia::render('Admin/AuditLog'))->name('audit');
    Route::get('/settings', fn () => Inertia::render('Admin/Settings'))->name('settings');
});
