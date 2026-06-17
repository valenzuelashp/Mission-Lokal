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
    Route::get('/verifications', fn () => Inertia::render('Admin/Verifications'))->name('verifications');
    Route::get('/profile-edits', fn () => Inertia::render('Admin/ProfileEdits'))->name('profile-edits');
    Route::get('/residents', fn () => Inertia::render('Admin/Residents/Index'))->name('residents.index');
    Route::get('/residents/{user}', fn () => Inertia::render('Admin/Residents/Show'))->name('residents.show');
    Route::get('/blotters', fn () => Inertia::render('Admin/Blotters/Index'))->name('blotters.index');
    Route::get('/announcements', fn () => Inertia::render('Admin/Announcements/Index'))->name('announcements.index');
    Route::get('/library', fn () => Inertia::render('Admin/Library/Index'))->name('library.index');
    Route::get('/audit', fn () => Inertia::render('Admin/AuditLog'))->name('audit');
    Route::get('/settings', fn () => Inertia::render('Admin/Settings'))->name('settings');
});
