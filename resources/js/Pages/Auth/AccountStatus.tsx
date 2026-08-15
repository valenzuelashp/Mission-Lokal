import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, ShieldAlert } from 'lucide-react';

interface SearchResult {
    account_id?: string;
    full_name?: string;
    status?: string;
    message?: string;
    not_found?: boolean;
}

interface Props {
    searchResult: SearchResult | null;
    query: string;
}

export default function AccountStatus({ searchResult, query }: Props) {
    const { data, setData, get, processing } = useForm({
        query: query || '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/account-status');
    };

    return (
        <>
            <Head title="Check Account Status | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    
                    {/* Header Navigation Links */}
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h1 className="text-lg font-bold text-gray-900">Mission-Lokal Portal</h1>
                        <div className="flex gap-2">
                            <Link href="/register" className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 border border-blue-200 rounded-md">Register</Link>
                            <Link href="/account-status" className="text-xs font-semibold text-white bg-blue-600 px-2.5 py-1 rounded-md">Check Status</Link>
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Check Your Account Status</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            Search your name or reference ID to view your current verification standing in the barangay system.
                        </p>
                    </div>

                    <form onSubmit={handleSearch} className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name or Reference ID
                            </label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="e.g. Timothy Talagtag" 
                                    value={data.query}
                                    onChange={e => setData('query', e.target.value)}
                                    required
                                />
                                <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </form>

                    {searchResult && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 space-y-3 text-sm">
                            {searchResult.not_found ? (
                                <div className="text-center py-4 text-amber-700">
                                    <ShieldAlert className="mx-auto h-8 w-8 mb-2 text-amber-600" />
                                    <p className="font-semibold">Record Not Found</p>
                                    <p className="text-xs text-gray-500 mt-1">{searchResult.message}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                                        <div>
                                            <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider">Resident Name</span>
                                            <span className="font-bold text-gray-900 text-base">{searchResult.full_name}</span>

                                        </div>
                                        <div>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                searchResult.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                searchResult.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                                searchResult.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                                                searchResult.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-200 text-gray-700'
                                            }`}>
                                                {searchResult.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="block text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Status Message</span>
                                        <p className="text-sm text-gray-700 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                            {searchResult.message}
                                        </p>
                                    </div>

                                    {searchResult.status === 'unverified' && (
                                        <div className="pt-2">
                                            <Link 
                                                href="/register"
                                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                            >
                                                Proceed to Registration Form
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="text-center border-t border-gray-200 pt-4">
                        <Link href="/login" className="text-sm font-medium text-blue-600 hover:underline">
                            Already have credentials? Login here
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}