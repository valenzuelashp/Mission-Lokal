<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\PersonnelLoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Resident & shared routes (Blueprint §7.1)
|--------------------------------------------------------------------------
*/

Route::get('/', fn () => redirect()->route('feed'));

Route::middleware(['auth', 'role:resident'])->group(function () {
    Route::get('/feed', fn () => Inertia::render('Resident/Feed'))->name('feed');
    Route::get('/concerns/new', fn () => Inertia::render('Resident/Concerns/New'))->name('concerns.create');
    Route::get('/concerns/{concern}', fn () => Inertia::render('Resident/Concerns/Show'))->name('concerns.show');
    Route::get('/library', fn () => Inertia::render('Resident/Library'))->name('library');
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
