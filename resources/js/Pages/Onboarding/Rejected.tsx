import { Head, Link } from '@inertiajs/react';

declare function route(name: string): string;

interface Props {
    reason?: string;
}

export default function Rejected({ reason }: Props) {
    return (
        <>
            <Head title="Application Disapproved | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-red-200">
                    
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-50 p-4 rounded-full">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-red-600 mb-2">Application Disapproved</h2>
                    
                    <p className="text-gray-600 mb-6">
                        Your resident access profile application was declined during verification evaluation.
                    </p>
                    
                    <div className="bg-red-50 rounded-lg p-4 mb-8 border border-red-100 text-left">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-red-800">Reason Provided:</h4>
                        <p className="mt-1 text-sm text-red-700">
                            {reason || 'Submitted documentation parameters could not confirm valid address verification within the primary boundary area.'}
                        </p>
                    </div>

                    <div className="flex flex-col space-y-3">
                        {/* Changed from <a> to Inertia <Link> to cleanly run without raw href state tracking bugs */}
                        <Link 
                            href={route('onboarding.id')} 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Resubmit Identification Documents
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