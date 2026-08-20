import { useEffect } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { ShieldAlert, Clock, XCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

declare const route: (name: string, params?: Record<string, unknown>) => string;

export default function OnboardingModal() {
    const { auth } = usePage<any>().props;
    const user = auth?.user;
    
    // Read the secure flag directly from Laravel
    const needsPasswordSetup = auth?.needs_password_setup;

    const rawStatus = user?.verification_status;
    const status = (rawStatus?.value || rawStatus || '').toLowerCase();
    const hasSubmittedId = !!user?.resident_profile?.government_id_storage_key;

    // REAL-TIME POLLING: Quietly check for status changes every 10 seconds
    useEffect(() => {
        if (user && user.role === 'resident' && (status === 'pending' || status === 'in_progress')) {
            const interval = setInterval(() => {
                router.reload({ only: ['auth'] });
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [status, user]);

    // Hide entirely if they are approved AND have already set their custom password
    if (!user || user.role !== 'resident' || (status === 'approved' && !needsPasswordSetup)) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-2xl">
                
                {/* 1. APPROVED VIEW: Automatically stays on screen until they actually change their password */}
                {status === 'approved' && needsPasswordSetup ? (
                    <>
                        <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
                        <h2 className="text-xl font-bold text-slate-900">Account Approved!</h2>
                        <p className="mb-6 mt-2 text-sm text-slate-600">
                            Your identity has been successfully verified by the barangay! Before you enter the feed, please set a secure password for your account.
                        </p>
                        <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                            <Link href={route('onboarding.password')}>
                                Set Secure Password
                            </Link>
                        </Button>
                    </>
                ) : 
                
                /* 2. WAITING ROOM VIEW */
                status === 'in_progress' || (status === 'pending' && hasSubmittedId) ? (
                    <>
                        <Clock className="mx-auto mb-4 h-12 w-12 text-amber-500" />
                        <h2 className="text-xl font-bold text-slate-900">
                            {status === 'in_progress' ? 'Admin is Reviewing' : 'Verification Pending'}
                        </h2>
                        <p className="mb-6 mt-2 text-sm text-slate-600">
                            {status === 'in_progress' 
                                ? 'An administrator is actively looking at your submitted ID right now. Please hold on.' 
                                : 'Your government ID has been submitted and is currently in the queue to be reviewed.'}
                        </p>
                        <div className="flex flex-col space-y-3">
                            <Button onClick={() => router.reload({ only: ['auth'] })} className="w-full bg-blue-600 hover:bg-blue-700">
                                Refresh Status
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href="/logout" method="post" as="button">Log Out</Link>
                            </Button>
                        </div>
                    </>
                ) : 
                
                /* 3. REJECTED VIEW */
                status === 'rejected' ? (
                    <>
                        <XCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
                        <h2 className="text-xl font-bold text-slate-900">Verification Rejected</h2>
                        <p className="mb-6 mt-2 text-sm text-slate-600">
                            There was an issue with your submitted ID. Please review the requirements and submit a clear, valid document.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/onboarding/id">Update ID Document</Link>
                        </Button>
                    </>
                ) : 
                
                /* 4. CATCH-ALL DEFAULT VIEW */
                (
                    <>
                        <ShieldAlert className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                        <h2 className="text-xl font-bold text-slate-900">Verify Your Identity</h2>
                        <p className="mb-6 mt-2 text-sm text-slate-600">
                            Welcome to Mission-Lokal! To keep our community safe, you must verify your resident details before you can interact with the feed.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/onboarding/confirm">Start Verification</Link>
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}