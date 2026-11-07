import { Head, Link } from '@inertiajs/react';
import { BadgeCheck, ShieldAlert } from 'lucide-react';

type Props = {
    verified: boolean;
    cardholderName: string | null;
};

export default function VerifyDigitalId({ verified, cardholderName }: Props) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
            <Head title="Verify Municipal Digital ID" />
            <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-9">
                <div className="mb-6 flex items-center gap-3">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${verified ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {verified ? <BadgeCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                    </span>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Mission-Lokal</p>
                        <h1 className="text-lg font-black text-slate-950">Digital ID verification</h1>
                    </div>
                </div>

                <div className={`rounded-2xl border p-5 ${verified ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
                    <p className={`text-sm font-black ${verified ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {verified ? 'Verified municipal resident' : 'ID could not be verified'}
                    </p>
                    {verified && cardholderName && (
                        <div className="mt-4 border-t border-emerald-200 pt-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Cardholder</p>
                            <p className="mt-1 text-lg font-black text-slate-950">{cardholderName}</p>
                            <p className="mt-1 text-xs text-emerald-900">Compare this name with the resident presenting the ID.</p>
                        </div>
                    )}
                    {!verified && (
                        <p className="mt-2 text-xs leading-relaxed text-rose-800">
                            This ID is invalid, inactive, or no longer approved. Please ask the cardholder to contact the barangay office.
                        </p>
                    )}
                </div>

                <p className="mt-5 text-xs leading-relaxed text-slate-600">
                    This check confirms the ID status with the Mission-Lokal municipal resident registry. It does not replace presentation of the physical or digital ID card.
                </p>
                <Link href="/" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-xs font-black text-white hover:bg-slate-800">
                    Go to Mission-Lokal
                </Link>
            </section>
        </main>
    );
}
