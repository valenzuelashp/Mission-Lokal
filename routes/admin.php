<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\MissionController;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\BlotterController;
/*
|--------------------------------------------------------------------------
| Admin routes (Blueprint §7.3)
|--------------------------------------------------------------------------
*/

    Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/map', fn () => Inertia::render('Admin/Map'))->name('map');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports');    
    Route::get('/reports/{concern}', [ReportController::class, 'show'])->name('reports.show');  
    Route::put('/reports/{concern}', [ReportController::class, 'update'])->name('reports.update');  
    Route::get('/missions', [MissionController::class, 'index'])->name('missions.index');
    Route::post('/missions', [MissionController::class, 'store'])->name('missions.store');
    Route::get('/missions/{mission}', [MissionController::class, 'show'])->name('missions.show');
    Route::get('/view-id/{path}', [VerificationController::class, 'viewId'])
        ->where('path', '.*') // Crucial: allows slashes in the path
        ->name('view-id');
    Route::prefix('verifications')->name('verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{user}', [VerificationController::class, 'show'])->name('show');
        Route::post('/{user}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{user}/reject', [VerificationController::class, 'reject'])->name('reject');
        
    });
    Route::get('/profile-edits', fn () => Inertia::render('Admin/ProfileEdits'))->name('profile-edits');
    Route::get('/residents', fn () => Inertia::render('Admin/Residents/Index'))->name('residents.index');
    Route::get('/residents/{user}', fn (string $user) => Inertia::render('Admin/Residents/Show', [
        'residentId' => $user,
    ]))->name('residents.show');
    Route::get('/blotters', [BlotterController::class, 'index'])->name('blotters.index');
    Route::get('/blotters/{blotter}', [BlotterController::class, 'show'])->name('blotters.show');
    Route::post('/blotters/{blotter}/approve', [BlotterController::class, 'approve'])->name('blotters.approve');
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
