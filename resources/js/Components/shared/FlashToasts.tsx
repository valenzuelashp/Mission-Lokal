import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { PageProps } from '@/Types';

export default function FlashToasts() {
    const { flash } = usePage<PageProps>().props;
    const message = flash?.success || flash?.error;
    const isError = Boolean(flash?.error);

    useEffect(() => {
        if (!message) {
            return;
        }

        const id = window.setTimeout(() => {
            // Visual timeout fade
        }, 6000);

        return () => window.clearTimeout(id);
    }, [message]);

    if (!message) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[999] flex justify-center px-4">
            <div
                className={
                    isError
                        ? 'pointer-events-auto flex items-center gap-3 max-w-md rounded-2xl border border-red-200 bg-rose-600 px-6 py-4 text-xs font-black text-white shadow-2xl animate-bounce-short'
                        : 'pointer-events-auto flex items-center gap-3 max-w-md rounded-2xl border border-emerald-200 bg-emerald-600 px-6 py-4 text-xs font-black text-white shadow-2xl'
                }
                role="status"
            >
                {isError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                <span>{message}</span>
            </div>
        </div>
    );
}