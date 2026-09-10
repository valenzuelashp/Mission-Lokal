import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
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
            // Session flash is one-shot; this only hides the banner visually.
        }, 6000);

        return () => window.clearTimeout(id);
    }, [message]);

    if (!message) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] flex justify-center px-4">
            <div
                className={
                    isError
                        ? 'pointer-events-auto max-w-lg rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800 shadow'
                        : 'pointer-events-auto max-w-lg rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow'
                }
                role="status"
            >
                {message}
            </div>
        </div>
    );
}
