import { Head, Link } from '@inertiajs/react';

// Tell TypeScript that Laravel's Ziggy route() function exists
declare function route(name: string): string;

export default function Pending() {
    return (
        <>
            <Head title="Verification Pending | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    
                    {/* Animate-Pulse Clock Icon for a "Waiting" feel */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-blue-50 p-4 rounded-full">
                            <svg className="w-16 h-16 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
                    
                    <p className="text-gray-600 mb-6">
                        Thank you for submitting your Government ID! Your account is currently under review by the Barangay Administration.
                    </p>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
                        <p className="text-sm text-gray-500">
                            For security purposes, you will not be able to access the resident feed until your identity has been manually verified. Please check back later.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-3">
                        <a 
                            href={route('onboarding.pending')} 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Refresh Status
                        </a>
                        
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Sign Out
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}