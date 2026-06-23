<?php

use App\Http\Controllers\Personnel\MissionController;
use App\Http\Controllers\Personnel\NotificationController;
use App\Http\Controllers\Auth\PersonnelLoginController;
use Illuminate\Support\Facades\Route;


/*
|--------------------------------------------------------------------------
| Personnel routes (Blueprint §7.2)
|--------------------------------------------------------------------------
*/

Route::prefix('personnel')->name('personnel.')->group(function () {
    Route::middleware('guest')->group(function () {
        Route::get('/login', [PersonnelLoginController::class, 'create'])->name('login');
        Route::post('/login', [PersonnelLoginController::class, 'store']);
    });

    Route::middleware(['auth', 'role:personnel'])->group(function () {
        Route::get('/missions', [MissionController::class, 'index'])->name('missions.index');
        Route::get('/missions/{mission}', [MissionController::class, 'show'])->name('missions.show');
        Route::patch('/missions/{mission}/status', [MissionController::class, 'updateStatus'])->name('missions.status');
        Route::patch('/missions/{mission}/checklist', [MissionController::class, 'toggleChecklist'])->name('missions.checklist');
        Route::get('/missions/{mission}/proof', [MissionController::class, 'proofForm'])->name('missions.proof');
        Route::post('/missions/{mission}/proof', [MissionController::class, 'storeProof'])->name('missions.proof.store');
        Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications');
    });
});
