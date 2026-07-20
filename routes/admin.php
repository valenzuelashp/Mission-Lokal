<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\MissionController;
use App\Http\Controllers\Admin\VerificationController;
use App\Http\Controllers\Admin\BlotterController;
use App\Http\Controllers\Admin\MapController; 
use App\Http\Controllers\Admin\ProfileEditController;
use App\Http\Controllers\Admin\ResidentController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\LibraryController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\SettingsController;

/*
|--------------------------------------------------------------------------
| Admin routes (Blueprint §7.3)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->name('admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/map', [MapController::class, 'index'])->name('map.index');
    
    // Explicit directory mappings matching Admin/Reports/Index & Show
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');    
    Route::get('/reports/{concern}', [ReportController::class, 'show'])->name('reports.show');  
    Route::put('/reports/{concern}', [ReportController::class, 'update'])->name('reports.update');  
    
    // Core Operational Report Actions Pipeline (Task A4/A5 workflows)
    Route::post('/reports/{id}/confirm-ai', [ReportController::class, 'confirmAI'])->name('reports.confirm-ai');
    Route::post('/reports/{id}/merge', [ReportController::class, 'mergeDuplicate'])->name('reports.merge');
    Route::post('/reports/{id}/reject', [ReportController::class, 'rejectConcern'])->name('reports.reject');
    Route::post('/reports/{id}/escalate', [ReportController::class, 'createMission'])->name('reports.escalate');
    
    Route::get('/missions', [MissionController::class, 'index'])->name('missions.index');
    Route::post('/missions', [MissionController::class, 'store'])->name('missions.store');
    Route::get('/missions/{mission}', [MissionController::class, 'show'])->name('missions.show');
    Route::post('/missions/{mission}/verify', [MissionController::class, 'verifyMission'])->name('missions.verify');
    
    Route::get('/view-id/{path}', [VerificationController::class, 'viewId'])
        ->where('path', '.*')
        ->name('view-id');

    Route::prefix('verifications')->name('verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{user}', [VerificationController::class, 'show'])->name('show');
        Route::post('/{user}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{user}/reject', [VerificationController::class, 'reject'])->name('reject');
    });

    Route::get('/profile-edits', [ProfileEditController::class, 'index'])->name('profile-edits.index');
    Route::post('/profile-edits/{id}/approve', [ProfileEditController::class, 'approve'])->name('profile-edits.approve');
    Route::post('/profile-edits/{id}/reject', [ProfileEditController::class, 'reject'])->name('profile-edits.reject');

    Route::get('/residents', [ResidentController::class, 'index'])->name('residents.index');
    Route::get('/residents/{user}', [ResidentController::class, 'show'])->name('residents.show');

    Route::get('/blotters', [BlotterController::class, 'index'])->name('blotters.index');
    Route::get('/blotters/{blotter}', [BlotterController::class, 'show'])->name('blotters.show');
    Route::post('/blotters/{blotter}/approve', [BlotterController::class, 'approve'])->name('blotters.approve');

    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/announcements/create', [AnnouncementController::class, 'create'])->name('announcements.create');
    Route::post('/announcements', [AnnouncementController::class, 'store'])->name('announcements.store');
    Route::get('/announcements/{announcement}/edit', [AnnouncementController::class, 'edit'])->name('announcements.edit');
    Route::put('/announcements/{announcement}', [AnnouncementController::class, 'update'])->name('announcements.update');
    Route::delete('/announcements/{announcement}', [AnnouncementController::class, 'destroy'])->name('announcements.destroy');

    Route::get('/library', [LibraryController::class, 'index'])->name('library.index');
    Route::post('/library', [LibraryController::class, 'store'])->name('library.store');
    Route::delete('/library/{id}', [LibraryController::class, 'destroy'])->name('library.destroy');

    Route::get('/audit', [AuditLogController::class, 'index'])->name('audit');

    Route::get('/settings', [SettingsController::class, 'edit'])->name('settings');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/security', [SettingsController::class, 'updateSecurity'])->name('settings.security');
});