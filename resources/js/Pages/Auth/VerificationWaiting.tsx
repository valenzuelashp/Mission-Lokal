import { Head, Link, useForm } from '@inertiajs/react';
import { Clock3, ShieldAlert } from 'lucide-react';

interface Props {
    status: string;
    rejection_reason?: string | null;
    full_name: string;
}

export default function VerificationWaiting({ status, rejection_reason, full_name }: Props) {
    const { post, processing } = useForm({});

    const title = status === 'rejected'
        ? 'Registration needs updates'
        : status === 'in_progress'
            ? 'Your registration is being reviewed'
            : status === 'pending'
                ? 'Waiting for barangay verification'
                : 'Complete registration first';

    const body = status === 'rejected'
        ? 'The barangay asked you to correct your details before an account can be approved.'
        : status === 'unverified'
            ? 'Your name is in the barangay list, but you still need to submit a registration with your email, phone number, and government ID.'
            : 'An administrator will compare your details with barangay records. Login credentials will be emailed to you after approval.';

    return (
        <>
            <Head title="Verification Pending | Mission-Lokal" />
            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        {status === 'rejected' ? (
                            <ShieldAlert className="h-6 w-6 text-amber-700" />
                        ) : (
                            <Clock3 className="h-6 w-6 text-amber-700" />
                        )}
                    </div>
                    <p className="text-sm text-slate-500">{full_name}</p>
                    <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-3 text-sm text-slate-600">{body}</p>

                    {status === 'rejected' && rejection_reason && (
                        <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                            {rejection_reason}
                        </p>
                    )}

                    <div className="mt-6 space-y-3">
                        {status === 'unverified' && (
                            <Link href="/register" className="block w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                                Go to registration
                            </Link>
                        )}
                        {status === 'rejected' && (
                            <Link href="/account-status" className="block w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700">
                                Check status and resubmit
                            </Link>
                        )}
                        <Link href="/account-status" className="block text-sm font-medium text-blue-600 hover:underline">
                            Check registration status
                        </Link>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => post('/logout')}
                            className="text-sm text-slate-500 hover:text-slate-800"
                        >
                            Log out
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
