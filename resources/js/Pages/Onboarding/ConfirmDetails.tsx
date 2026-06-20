import { Head, Link } from '@inertiajs/react';

// Tell TypeScript that Laravel's Ziggy route() function exists globally
declare function route(name: string, params?: any, absolute?: boolean): string;

// Define the shape of the data coming from our Laravel Controller
interface ResidentData {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    name_extension: string | null;
    birthday: string;
    address: string | null;
    mobile: string | null;
}

interface Props {
    residentData: ResidentData;
}

export default function ConfirmDetails({ residentData }: Props) {
    return (
        <>
            <Head title="Confirm Details | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                {/* Main Card */}
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Confirm Your Details</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            We found your record in the barangay system. Please verify that this information is correct before proceeding.
                        </p>
                    </div>

                    {/* Data Display */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-3 text-sm">
                        
                        {/* Name */}
                        <div>
                            <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Full Name</span>
                            <span className="font-medium text-gray-900">
                                {residentData.first_name} {residentData.middle_name ? residentData.middle_name + ' ' : ''}
                                {residentData.last_name} {residentData.name_extension ? ' ' + residentData.name_extension : ''}
                            </span>
                        </div>

                        {/* Birthday */}
                        <div>
                            <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Birthday</span>
                            <span className="font-medium text-gray-900">{residentData.birthday}</span>
                        </div>

                        {/* Address */}
                        {residentData.address && (
                            <div>
                                <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Address</span>
                                <span className="font-medium text-gray-900">{residentData.address}</span>
                            </div>
                        )}

                        {/* Mobile */}
                        {residentData.mobile && (
                            <div>
                                <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Mobile Number</span>
                                <span className="font-medium text-gray-900">{residentData.mobile}</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* If correct, send them to the ID Upload step */}
                        <Link 
                            href={route('onboarding.id')} 
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Yes, this is correct
                        </Link>

                        {/* If incorrect, give them an out */}
                        <div className="text-center">
                            <button className="text-sm font-medium text-gray-500 hover:text-gray-700 underline">
                                There is a mistake in my details
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}