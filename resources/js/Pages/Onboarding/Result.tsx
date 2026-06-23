import { Head, Link } from '@inertiajs/react';

declare function route(name: string): string;

interface ResultProps {
    status: 'approved' | 'rejected';
    rejectionReason: string | null;
}

export default function Result({ status, rejectionReason }: ResultProps) {
    const isApproved = status === 'approved';

    return (
        <>
            <Head title={`Verification ${isApproved ? 'Approved' : 'Rejected'} | Onboarding`} />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-t-transparent" 
                     style={{ borderTopColor: isApproved ? '#10B981' : '#EF4444' }}>
                    
                    {/* Dynamic Icon based on status */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${isApproved ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                            {isApproved ? (
                                // Green Checkmark
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            ) : (
                                // Red X
                                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            )}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isApproved ? 'Identity Verified!' : 'Verification Failed'}
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                        {isApproved 
                            ? 'Your government ID has been successfully verified by the Barangay Administration. You can now set up your account password.' 
                            : 'Unfortunately, your ID verification was rejected by the administration for the following reason:'}
                    </p>

                    {/* Show rejection reason box if rejected */}
                    {!isApproved && rejectionReason && (
                        <div className="bg-red-50 rounded-lg p-4 mb-8 border border-red-100 text-left">
                            <span className="font-semibold text-red-800 text-sm block mb-1">Admin Note:</span>
                            <p className="text-sm text-red-700 italic">"{rejectionReason}"</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 mt-4">
                        {isApproved ? (
                            <a 
                                href={route('onboarding.password')} 
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            >
                                Continue to Set Password
                            </a>
                        ) : (
                            <a 
                                href={route('onboarding.id')} 
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                            >
                                Upload a New ID
                            </a>
                        )}
                        
                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button"
                            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            Sign Out
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}