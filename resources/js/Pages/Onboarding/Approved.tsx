import { Head, Link } from '@inertiajs/react';

// Extend the window type definition locally for Ziggy support
declare global {
    interface Window {
        route: (name: string, parameters?: any) => string;
    }
}

export default function Approved() {
    return (
        <>
            <Head title="Verification Approved | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-green-200">
                    
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-50 p-4 rounded-full">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Complete</h2>
                    
                    <p className="text-gray-600 mb-6">
                        Your identity has been successfully verified! Your Mission-Lokal account is now fully active.
                    </p>

                    <div className="flex flex-col space-y-3">
                        <Link 
                            href="/feed" 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                        >
                            Enter System Workspace
                        </Link>
                        
                        <Link 
                            href={window.route('logout')} 
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