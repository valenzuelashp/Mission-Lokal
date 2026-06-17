<?php

use App\Http\Controllers\Auth\PersonnelLoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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
        Route::get('/missions', fn () => Inertia::render('Personnel/Missions/Index'))->name('missions.index');
        Route::get('/missions/{mission}', fn () => Inertia::render('Personnel/Missions/Show'))->name('missions.show');
        Route::get('/missions/{mission}/proof', fn () => Inertia::render('Personnel/Missions/Proof'))->name('missions.proof');
        Route::get('/notifications', fn () => Inertia::render('Personnel/Notifications'))->name('notifications');
    });
});
