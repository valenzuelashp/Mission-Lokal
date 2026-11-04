import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import type { PageProps } from '@/Types';

export default function FlashToasts() {
    const { flash } = usePage<PageProps>().props;
    const message = flash?.success || flash?.error;
    const isError = Boolean(flash?.error);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setVisible(true);
        if (!message) {
            return;
        }

        const id = window.setTimeout(() => {
            setVisible(false);
        }, 6000);

        return () => window.clearTimeout(id);
    }, [message]);

    if (!message || !visible) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[999] flex justify-center px-4">
            <div
                className={
                    isError
                        ? 'toast-enter pointer-events-auto flex items-center gap-3 max-w-md rounded-2xl border border-red-200 bg-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-2xl'
                        : 'toast-enter pointer-events-auto flex items-center gap-3 max-w-md rounded-2xl border border-emerald-200 bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-2xl'
                }
                role="status"
            >
                {isError ? <AlertCircle className="h-5 w-5 shrink-0" /> : <CheckCircle2 className="h-5 w-5 shrink-0" />}
                <span>{message}</span>
                <button type="button" onClick={() => setVisible(false)} aria-label="Dismiss notification"
                    className="ml-1 rounded-lg p-1 opacity-80 hover:bg-white/15 hover:opacity-100">
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}