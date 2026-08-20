import { Head, useForm } from '@inertiajs/react';
import { KeyRound, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

declare const route: (name: string, params?: Record<string, unknown>) => string;

interface Props {
    mode?: 'prompt' | 'setup';
}

export default function PasswordPromptModal({ mode = 'prompt' }: Props) {
    const isSetupMode = mode === 'setup';
    const [showForm, setShowForm] = useState(isSetupMode);

    const { post: postDismiss, processing: processingDismiss } = useForm({});

    const { data, setData, post, processing, errors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleDismiss = (e: React.FormEvent) => {
        e.preventDefault();
        postDismiss(route('password.prompt.dismiss'));
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('password.custom.store'));
    };

    return (
        <>
            <Head title="Secure Your Account | Mission-Lokal" />

            <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    {!showForm ? (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                                    <ShieldAlert className="h-6 w-6 text-amber-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">Temporary Password Detected</h2>
                                <p className="text-slate-500 mt-2 text-sm">
                                    You are currently logged in with a temporary system-generated password. Would you like to create your own secure unique password now?
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(true)}
                                    className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Change Password Now
                                </button>

                                <form onSubmit={handleDismiss}>
                                    <button
                                        type="submit"
                                        disabled={processingDismiss}
                                        className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                    >
                                        Remind Me Next Time
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-center mb-6">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                    <Lock className="h-6 w-6 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {isSetupMode ? 'Set Secure Password' : 'Set New Password'}
                                </h2>
                                <p className="text-slate-500 mt-2 text-sm">
                                    {isSetupMode
                                        ? 'Your account has been approved. Create a personal password before using the feed.'
                                        : 'Must be at least 8 characters long and contain at least 1 number and 1 special symbol.'}
                                </p>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <p className="text-xs text-slate-500">
                                    Must be at least 8 characters with 1 number and 1 special symbol.
                                </p>

                                <div className="space-y-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Save Secure Password
                                    </button>

                                    {!isSetupMode && (
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="w-full flex justify-center py-2.5 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                                        >
                                            Back
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
