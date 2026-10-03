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
                        ? 'pointer-events-auto flex items-center gap-2.5 max-w-md rounded-2xl border border-red-200 bg-red-600 px-5 py-3 text-xs font-bold text-white shadow-xl animate-bounce-short'
                        : 'pointer-events-auto flex items-center gap-2.5 max-w-md rounded-2xl border border-emerald-200 bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-xl'
                }
                role="status"
            >
                {isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{message}</span>
            </div>
        </div>
    );
}