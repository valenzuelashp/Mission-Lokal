<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SuperAdmin\BarangayManagementController;
use App\Http\Controllers\SuperAdmin\ProfileEditController;
use App\Http\Controllers\SuperAdmin\SecurityClearanceController;
use App\Http\Middleware\EnsureSuperAdmin;

/*
|--------------------------------------------------------------------------
| Super Admin routes
|--------------------------------------------------------------------------
*/

Route::prefix('super-admin')->name('super_admin.')->middleware(['auth', EnsureSuperAdmin::class])->group(function () {
    
    // Dashboard & Barangay Management
    Route::get('/dashboard', [BarangayManagementController::class, 'dashboard'])->name('dashboard');
    Route::get('/barangays', [BarangayManagementController::class, 'index'])->name('barangays.index');
    Route::post('/barangays', [BarangayManagementController::class, 'store'])->name('barangays.store');
    Route::post('/barangays/view-only-admin', [BarangayManagementController::class, 'storeViewOnlyAdmin'])->name('barangays.view_only');
    Route::put('/barangays/{barangay}', [BarangayManagementController::class, 'update'])->name('barangays.update');

    // Barangay Suspension Appeals Queue
    Route::get('/barangay-appeals', [BarangayManagementController::class, 'appealsIndex'])->name('appeals.index');
    Route::post('/barangay-appeals/{appealId}/resolve', [BarangayManagementController::class, 'resolveAppeal'])->name('appeals.resolve');

    // Admin/Barangay Profile Edit Requests
    Route::get('/profile-edits', [ProfileEditController::class, 'index'])->name('profile_edits.index');
    Route::post('/profile-edits/{id}/approve', [ProfileEditController::class, 'approve'])->name('profile_edits.approve');
    Route::post('/profile-edits/{id}/reject', [ProfileEditController::class, 'reject'])->name('profile_edits.reject');

    // Security Clearance Key Requests (For Admin Password Resets)
    Route::get('/clearances', [SecurityClearanceController::class, 'index'])->name('clearances.index');
    Route::post('/clearances/{id}/approve', [SecurityClearanceController::class, 'approve'])->name('clearances.approve');
    Route::post('/clearances/{id}/reject', [SecurityClearanceController::class, 'reject'])->name('clearances.reject');

});