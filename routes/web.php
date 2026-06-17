<?php

use App\Enums\UserRole;
use App\Http\Controllers\Resident\ConcernController;
use App\Http\Controllers\Resident\FeedController;
use App\Http\Controllers\Resident\LibraryController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PersonnelLoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Resident & shared routes (Blueprint §7.1)
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (! auth()->check()) {
        return redirect()->route('login');
    }

    return match (auth()->user()->role) {
        UserRole::Admin => redirect()->route('admin.dashboard'),
        UserRole::Personnel => redirect()->route('personnel.missions.index'),
        default => redirect()->route('feed'),
    };
});

Route::middleware(['auth', 'role:resident'])->group(function () {
    Route::get('/feed', [FeedController::class, 'index'])->name('feed');
    Route::get('/concerns/new', [ConcernController::class, 'create'])->name('concerns.create');
    Route::post('/concerns', [ConcernController::class, 'store'])->name('concerns.store');
    Route::get('/concerns/{concern}', [ConcernController::class, 'show'])->name('concerns.show');
    Route::get('/library', [LibraryController::class, 'index'])->name('library');
    Route::get('/announcements', fn () => Inertia::render('Resident/Announcements'))->name('announcements');
    Route::get('/profile', fn () => Inertia::render('Resident/Profile'))->name('profile');
    Route::get('/profile/edit', fn () => Inertia::render('Resident/ProfileEdit'))->name('profile.edit');
    Route::get('/profile/security', fn () => Inertia::render('Resident/Security'))->name('profile.security');
    Route::get('/blotter/new', fn () => Inertia::render('Resident/Blotter/TypeSelect'))->name('blotter.create');
    Route::get('/blotter/new/{type}', fn () => Inertia::render('Resident/Blotter/Form'))->name('blotter.form');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/forgot-password', fn () => Inertia::render('Auth/ForgotPassword'))->name('password.request');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth'])->prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/confirm', fn () => Inertia::render('Onboarding/ConfirmDetails'))->name('confirm');
    Route::get('/id', fn () => Inertia::render('Onboarding/IdVerification'))->name('id');
    Route::get('/pending', fn () => Inertia::render('Onboarding/Pending'))->name('pending');
    Route::get('/result', fn () => Inertia::render('Onboarding/Result'))->name('result');
    Route::get('/password', fn () => Inertia::render('Onboarding/Password'))->name('password');
});

require __DIR__.'/personnel.php';
require __DIR__.'/admin.php';
