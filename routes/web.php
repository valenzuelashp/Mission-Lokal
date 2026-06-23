<?php
use App\Http\Controllers\Admin\DashboardController; // <-- ADD THIS AT THE TOP
use App\Http\Controllers\Admin\VerificationController;
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

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
        Route::prefix('verifications')->name('verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{user}', [VerificationController::class, 'show'])->name('show');
        Route::post('/{user}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{user}/reject', [VerificationController::class, 'reject'])->name('reject');
    });
   
});

Route::middleware(['auth', 'role:resident', 'verified.resident'])->group(function () {
    Route::get('/feed', [FeedController::class, 'index'])->name('feed');
    Route::get('/concerns/new', [ConcernController::class, 'create'])->name('concerns.create');
    Route::post('/concerns', [ConcernController::class, 'store'])->name('concerns.store');
    Route::get('/concerns/{concern}', [ConcernController::class, 'show'])->name('concerns.show');
    Route::post('/concerns/{concern}/vote', [ConcernController::class, 'vote'])->name('concerns.vote');
    Route::get('/library', [LibraryController::class, 'index'])->name('library');
    Route::get('/announcements', fn () => Inertia::render('Resident/Announcements'))->name('announcements');
    Route::get('/announcements/{announcement}', fn (string $announcement) => Inertia::render('Resident/Announcements/Show', [
        'announcementId' => $announcement,
    ]))->name('announcements.show');
    Route::get('/profile', fn () => Inertia::render('Resident/Profile'))->name('profile');
    Route::get('/profile/edit', fn () => Inertia::render('Resident/ProfileEdit'))->name('profile.edit');
    Route::post('/profile/edit', fn () => redirect()->route('profile.edit')->with('success', 'Edit request submitted for admin review.'))->name('profile.edit.store');
    Route::get('/profile/security', fn () => Inertia::render('Resident/Security'))->name('profile.security');
    Route::post('/profile/security', fn () => redirect()->route('profile.security')->with('success', 'Password updated successfully.'))->name('profile.security.store');
    Route::get('/blotter/new', fn () => Inertia::render('Resident/Blotter/TypeSelect'))->name('blotter.create');
    Route::get('/blotter/new/{type}', fn (string $type) => Inertia::render('Resident/Blotter/Form', [
        'blotterType' => $type,
    ]))->name('blotter.form');
    Route::post('/blotter', fn () => redirect()->route('feed')->with('success', 'Blotter submitted. You will receive a ticket number after admin approval.'))->name('blotter.store');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/forgot-password', fn () => Inertia::render('Auth/ForgotPassword'))->name('password.request');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

Route::middleware(['auth'])->prefix('onboarding')->name('onboarding.')->group(function () {
    
    // FIX: Send the user to the Controller so it can grab the database data!
    Route::get('/confirm', [\App\Http\Controllers\OnboardingController::class, 'showConfirmDetails'])->name('confirm');
    
    Route::get('/id', fn () => Inertia::render('Onboarding/IdVerification'))->name('id');
    Route::post('/id', [\App\Http\Controllers\OnboardingController::class, 'storeId'])->name('id.store');
    
    // NEW: Let the Controller decide if they should see Pending or Results
    Route::get('/pending', [\App\Http\Controllers\OnboardingController::class, 'showPending'])->name('pending');
    Route::get('/result', [\App\Http\Controllers\OnboardingController::class, 'showResult'])->name('result');
    
    Route::get('/password', fn () => Inertia::render('Onboarding/Password'))->name('password');
});

require __DIR__.'/personnel.php';
require __DIR__.'/admin.php';
