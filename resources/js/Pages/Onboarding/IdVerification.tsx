import { Head, useForm } from '@inertiajs/react';

export default function IdVerification() {
    const { data, setData, post, processing, errors } = useForm({
        government_id: null as File | null,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // @ts-ignore
        post(window.route('onboarding.id.store'));
    };

    return (
        <>
            <Head title="Upload ID | Onboarding" />

            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            To ensure the security of our barangay, please upload a clear photo of a valid Government ID.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Government ID Photo
                            </label>
                            
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-500 transition-colors bg-gray-50">
                                <div className="space-y-1 text-center">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1">
                                            <span>Upload a file</span>
                                            <input 
                                                id="file-upload" 
                                                name="file-upload" 
                                                type="file" 
                                                className="sr-only" 
                                                accept="image/jpeg, image/png, image/jpg"
                                                onChange={(e) => setData('government_id', e.target.files ? e.target.files[0] : null)}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                            </div>
                            
                            {data.government_id && (
                                <p className="mt-2 text-sm text-green-600 font-medium text-center">
                                    Selected: {data.government_id.name}
                                </p>
                            )}

                            {errors.government_id && (
                                <p className="mt-2 text-sm text-red-600">{errors.government_id}</p>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing || !data.government_id}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        >
                            {processing ? 'Uploading...' : 'Submit ID'}
                        </button>
                    </form>

                </div>
            </div>
        </>
    );
}