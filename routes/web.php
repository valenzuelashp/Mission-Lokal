<?php

use App\Http\Controllers\Admin\DashboardController; 
use App\Http\Controllers\Admin\VerificationController;
use App\Enums\UserRole;
use App\Http\Controllers\Resident\ConcernController;
use App\Http\Controllers\Resident\ProfileController;
use App\Http\Controllers\Resident\LibraryController;
use App\Http\Controllers\Resident\SecurityController;
use App\Http\Controllers\Resident\AnnouncementController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\OnboardingController;
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

/*
|--------------------------------------------------------------------------
| Admin Portal Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::prefix('verifications')->name('verifications.')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('index');
        Route::get('/{user}', [VerificationController::class, 'show'])->name('show');
        Route::post('/{user}/approve', [VerificationController::class, 'approve'])->name('approve');
        Route::post('/{user}/reject', [VerificationController::class, 'reject'])->name('reject');
    });
});

/*
|--------------------------------------------------------------------------
| Resident Portal Routes (Protected by Verification Middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:resident', 'verified.resident'])->group(function () {
    // Consolidated Concern & Feed Pipelines (R8, R9, R10 mapped directly to ConcernController)
    Route::get('/feed', [ConcernController::class, 'index'])->name('feed');
    Route::get('/concerns/new', [ConcernController::class, 'create'])->name('concerns.create');
    Route::post('/concerns', [ConcernController::class, 'store'])->name('concerns.store');
    Route::get('/concerns/{concern}', [ConcernController::class, 'show'])->name('concerns.show');
    Route::post('/concerns/{concern}/vote', [ConcernController::class, 'vote'])->name('concerns.vote');
    
    Route::get('/library', [LibraryController::class, 'index'])->name('library');
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
    
    // R13 Profile Management Routes
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/edit', [ProfileController::class, 'update'])->name('profile.edit.store');
    
    // R14 Security Management Routes
    Route::get('/profile/security', [SecurityController::class, 'index'])->name('profile.security');
    Route::put('/profile/security', [SecurityController::class, 'updatePassword'])->name('profile.security.update');
    
    // R15-R16 Blotter Management Routes
    Route::get('/blotter/new', fn () => Inertia::render('Resident/Blotter/TypeSelect'))->name('blotter.create');
    Route::get('/blotter/new/{type}', fn (string $type) => Inertia::render('Resident/Blotter/Form', [
        'blotterType' => $type,
    ]))->name('blotter.form');
    Route::get('/blotters', [\App\Http\Controllers\Resident\BlotterController::class, 'index'])->name('blotters.index');
    Route::post('/blotter', [\App\Http\Controllers\Resident\BlotterController::class, 'store'])->name('blotter.store');
});

/*
|--------------------------------------------------------------------------
| Guest Authentication Routes (Including Forgot Password OTP)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    view()->exists('auth.login') ? Route::get('/login', [LoginController::class, 'create'])->name('login') : null;
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
    Route::get('/forgot-password', [ForgotPasswordController::class, 'showRequestForm'])->name('password.request');
    Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp'])->name('password.email');
    Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp'])->name('password.verify');
    Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword'])->name('password.update');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

/*
|--------------------------------------------------------------------------
| Onboarding Verification Portal Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/confirm', [OnboardingController::class, 'showConfirmDetails'])->name('confirm');
    Route::get('/id', fn () => Inertia::render('Onboarding/IdVerification'))->name('id');
    Route::post('/id', [OnboardingController::class, 'storeId'])->name('id.store');
    
    Route::get('/pending', [OnboardingController::class, 'showPending'])->name('pending');
    Route::get('/result', [OnboardingController::class, 'showPasswordForm'])->name('result');
    Route::get('/password', [OnboardingController::class, 'showSetPassword'])->name('password');
    Route::post('/password/store', [OnboardingController::class, 'storePassword'])->name('password.store');
});

require __DIR__.'/personnel.php';
require __DIR__.'/admin.php';

/*
|--------------------------------------------------------------------------
| Temporary Design Previews
|--------------------------------------------------------------------------
*/
Route::get('/preview/pending', function () {
    return Inertia::render('Onboarding/Pending', ['status' => 'pending']);
});
Route::get('/preview/rejected', function () {
    return Inertia::render('Onboarding/Result', ['status' => 'rejected', 'rejectionReason' => 'Invalid document resolution.']);
});
Route::get('/preview/approved', function () {
    return Inertia::render('Onboarding/Result', ['status' => 'approved']);
});

Route::get('/force-drop', function() {
    Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS audit_logs');
    return 'Table dropped successfully! You can now run the migration.';
});