import { Head, useForm } from '@inertiajs/react';

export default function Password() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        post(window.route('onboarding.password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Create Password | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Secure Your Account</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Your identity has been verified! Please create a strong password to complete your registration.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        {/* New Password Input Group */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                New Password
                            </label>
                            <input 
                                id="password" 
                                type="password" 
                                value={data.password} 
                                onChange={e => setData('password', e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="••••••••"
                                required 
                            />
                            {/* Intercepts separate number/symbol errors here to show the clean combined line */}
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.password.includes('number') || errors.password.includes('symbol')
                                        ? 'The password field must contain at least one number & one symbol.'
                                        : errors.password}
                                </p>
                            )}
                        </div>

                        {/* Confirm Password Input Group */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirmation">
                                Confirm Password
                            </label>
                            <input 
                                id="password_confirmation" 
                                type="password" 
                                value={data.password_confirmation} 
                                onChange={e => setData('password_confirmation', e.target.value)} 
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="••••••••"
                                required 
                            />
                            {/* Displays matching/confirmation specific errors explicitly under this input */}
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        {/* Requirement Hint Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500 space-y-1">
                            <p className="font-semibold text-slate-700">Password requirements:</p>
                            <p className="text-slate-600">• Minimum 8 characters long</p>
                            <p className="text-slate-600">• Contain at least 1 numeric character</p>
                            <p className="text-slate-600">• Contain at least 1 special character symbol</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Saving...' : 'Complete Registration'}
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
}