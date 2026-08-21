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
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\TemporaryPasswordController;
use App\Http\Controllers\Auth\AccountStatusController;
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

    $user = auth()->user();
    
    // Safely parse role whether it's an Enum instance or a raw string database column
    $role = $user->role instanceof UserRole ? $user->role->value : $user->role;

    if ($role === 'admin' || $role === UserRole::Admin) {
        return redirect()->route('admin.dashboard');
    }

    if ($role === 'personnel' || $role === UserRole::Personnel) {
        return redirect()->route('personnel.missions.index');
    }

        // If resident hasn't changed password yet and hasn't dismissed the prompt this session
        if ($user->needsPasswordSetup() && ! session('dismissed_password_prompt')) {
            return redirect()->route('password.prompt');
        }

    return redirect()->route('feed');
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
| Temporary Password Prompt & Setup Routes (For accounts using default credentials)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:resident'])->group(function () {
    Route::get('/welcome/password-prompt', [TemporaryPasswordController::class, 'showPrompt'])->name('password.prompt');
    Route::post('/welcome/password-prompt/dismiss', [TemporaryPasswordController::class, 'dismiss'])->name('password.prompt.dismiss');

    Route::get('/welcome/setup-password', [TemporaryPasswordController::class, 'showForm'])->name('password.custom.show');
    Route::post('/welcome/setup-password', [TemporaryPasswordController::class, 'update'])->name('password.custom.store');

    Route::prefix('onboarding')->name('onboarding.')->group(function () {
        Route::get('/password', [TemporaryPasswordController::class, 'showOnboardingForm'])->name('password');
    });
});

/*
|--------------------------------------------------------------------------
| Resident Portal Routes (Protected by Verification Middleware)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:resident', 'verified.resident'])->group(function () {
    Route::get('/notifications', [\App\Http\Controllers\Resident\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/feed', [ConcernController::class, 'index'])->name('feed');
    Route::get('/concerns/new', [ConcernController::class, 'create'])->name('concerns.create');
    
    // ATTACHED RATE LIMITER: Prevents concern spam (max 3 per minute)
    Route::post('/concerns', [ConcernController::class, 'store'])->name('concerns.store')->middleware('throttle:reports');
    
    Route::get('/concerns/{concern}', [ConcernController::class, 'show'])->name('concerns.show');
    Route::post('/concerns/{concern}/vote', [ConcernController::class, 'vote'])->name('concerns.vote');
    
    Route::get('/library', [LibraryController::class, 'index'])->name('library');
    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements');
    Route::get('/announcements/{announcement}', [AnnouncementController::class, 'show'])->name('announcements.show');
    
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::get('/profile/edit', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile/edit', [ProfileController::class, 'update'])->name('profile.edit.store');
    
    Route::get('/profile/security', [SecurityController::class, 'index'])->name('profile.security');
    Route::put('/profile/security', [SecurityController::class, 'updatePassword'])->name('profile.security.update');
    
    Route::get('/blotter/new', fn () => Inertia::render('Resident/Blotter/TypeSelect'))->name('blotter.create');
    Route::get('/blotter/new/{type}', fn (string $type) => Inertia::render('Resident/Blotter/Form', [
        'blotterType' => $type,
    ]))->name('blotter.form');
    Route::get('/blotters', [\App\Http\Controllers\Resident\BlotterController::class, 'index'])->name('blotters.index');
    Route::post('/blotter', [\App\Http\Controllers\Resident\BlotterController::class, 'store'])->name('blotter.store');
});

/*
|--------------------------------------------------------------------------
| Guest Authentication Routes (Including Registration & Forgot Password)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    
    // ATTACHED RATE LIMITER: Prevents brute-force guessing (max 5 per minute)
    Route::post('/login', [LoginController::class, 'store'])->middleware('throttle:login');
    
    // Resident Registration Routes
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);

    Route::get('/account-status', [AccountStatusController::class, 'search'])->name('account.status');
    Route::get('/account-status/resubmit-form/{id}', [AccountStatusController::class, 'showResubmitForm'])->name('account.resubmit.form');
    Route::post('/account-status/resubmit-form/{id}', [AccountStatusController::class, 'storeResubmit'])->name('account.resubmit.store');

    Route::get('/forgot-password', [ForgotPasswordController::class, 'showRequestForm'])->name('password.request');
    
    // ATTACHED RATE LIMITER: Prevents email sending spam (max 3 per minute)
    Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp'])->name('password.email')->middleware('throttle:otp');
    Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp'])->name('password.verify')->middleware('throttle:otp');
    
    Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword'])->name('password.update');
});

Route::post('/logout', [LoginController::class, 'destroy'])->middleware('auth')->name('logout');

require __DIR__.'/personnel.php';
require __DIR__.'/admin.php';

/*
|--------------------------------------------------------------------------
| Testing & Utility Routes
|--------------------------------------------------------------------------
*/
Route::get('/force-drop', function() {
    Illuminate\Support\Facades\DB::statement('DROP TABLE IF EXISTS audit_logs');
    return 'Table dropped successfully! You can now run the migration.';
});

//PHASE 9: Service Worker Global Scope Override
Route::get('/sw.js', function () {
    $path = public_path('build/sw.js');
    if (!file_exists($path)) abort(404);
    
    return response()->file($path, [
        'Content-Type' => 'application/javascript',
        'Service-Worker-Allowed' => '/',
    ]);
});