import { Head, Link } from '@inertiajs/react';

declare function route(name: string): string;

export default function Pending({ status }: { status: string }) {
    return (
        <>
            <Head title="Verification Pending | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    
                    {status === 'in_progress' ? (
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="bg-purple-50 p-4 rounded-full">
                                    <svg className="w-16 h-16 text-purple-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin is Reviewing!</h2>
                            <p className="text-gray-600 mb-6">
                                Please hold on, an administrator is actively looking at your submitted ID and profile right now.
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="bg-blue-50 p-4 rounded-full">
                                    <svg className="w-16 h-16 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
                            <p className="text-gray-600 mb-6">
                                Thank you for submitting your Government ID! Your account is currently in the queue to be reviewed by the Barangay Administration.
                            </p>
                        </>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-8 border border-gray-200">
                        <p className="text-sm text-gray-500">
                            For security purposes, you will not be able to access the resident feed until your identity has been manually verified. Please check back later.
                        </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <Link 
                            href="/feed" 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Refresh Status
                        </Link>
                        
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            type="button"
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