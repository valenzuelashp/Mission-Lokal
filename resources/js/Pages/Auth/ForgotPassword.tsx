import { Head, useForm, Link } from '@inertiajs/react';
import React, { useState } from 'react';

// Tell TypeScript about Ziggy's route function
declare function route(name: string): string;

export default function ForgotPassword() {
    // Track which screen to show: 1 (Email), 2 (OTP), or 3 (New Password)
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // One form object to hold data across all three steps
    const { data, setData, post, processing, errors, clearErrors } = useForm({
        email: '',
        otp: '',
        password: '',
        password_confirmation: '',
    });

    // Step 1: Send the Email
    const submitEmail = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route('password.email'), {
            preserveScroll: true,
            onSuccess: () => setStep(2), // Move to step 2 if backend says success!
        });
    };

    // Step 2: Verify the Code
    const submitOtp = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route('password.verify'), {
            preserveScroll: true,
            onSuccess: () => setStep(3), // Move to step 3 if the code matches!
        });
    };

    // Step 3: Save New Password
    const submitNewPassword = (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        post(route('password.update')); // On success, the backend redirects them to login
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <Head title="Forgot Password" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {step === 1 && "Enter your email to receive a verification code."}
                    {step === 2 && "Enter the 6-digit code sent to your email."}
                    {step === 3 && "Create a new secure password."}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    
                    {/* ============================== */}
                    {/* STEP 1: EMAIL REQUEST FORM     */}
                    {/* ============================== */}
                    {step === 1 && (
                        <form className="space-y-6" onSubmit={submitEmail}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email address</label>
                                <div className="mt-1">
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                    {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Sending...' : 'Send Verification Code'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ============================== */}
                    {/* STEP 2: OTP VERIFICATION FORM  */}
                    {/* ============================== */}
                    {step === 2 && (
                        <form className="space-y-6" onSubmit={submitOtp}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 text-center">6-Digit Code</label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={data.otp}
                                        onChange={e => setData('otp', e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg text-center tracking-widest font-bold"
                                        placeholder="••••••"
                                        required
                                    />
                                    {errors.otp && <p className="mt-2 text-sm text-center text-red-600">{errors.otp}</p>}
                                </div>
                            </div>
                            <div className="flex flex-col space-y-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Verifying...' : 'Verify Code'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Wrong email? Go back.
                                </button>
                            </div>
                        </form>
                    )}

                    {/* ============================== */}
                    {/* STEP 3: NEW PASSWORD FORM      */}
                    {/* ============================== */}
                    {step === 3 && (
                        <form className="space-y-6" onSubmit={submitNewPassword}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                    {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="mt-1">
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={e => setData('password_confirmation', e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Saving...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    )}

                </div>
                
                <div className="mt-6 text-center text-sm">
                    <Link href={route('login')} className="font-medium text-blue-600 hover:text-blue-500">
                        &larr; Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}