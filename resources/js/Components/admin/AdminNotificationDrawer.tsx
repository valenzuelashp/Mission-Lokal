import { router } from '@inertiajs/react';
import { Bell, CheckSquare, ClipboardList, FileText, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/Lib/utils';

type AdminNotification = {
    id: string;
    title: string;
    body: string;
    sent_at: string;
    read: boolean;
    concern_id: string | null;
    mission_id: string | null;
    registration_id?: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onLoaded?: () => void;
};

function destination(notification: AdminNotification): string | null {
    if (notification.concern_id) {
        return `/admin/reports/${notification.concern_id}`;
    }
    if (notification.mission_id) {
        return `/admin/missions/${notification.mission_id}`;
    }
    if (notification.registration_id) {
        return `/admin/verifications/${notification.registration_id}`;
    }

    return null;
}

function NotificationIcon({ notification, unread }: { notification: AdminNotification; unread: boolean }) {
    const Icon = notification.concern_id
        ? FileText
        : notification.mission_id
          ? ClipboardList
          : notification.registration_id
            ? CheckSquare
            : Bell;

    return (
        <span
            className={cn(
                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                unread ? 'border-sky-500 bg-sky-600 text-white' : 'border-slate-200 bg-slate-100 text-slate-600',
            )}
        >
            <Icon className="h-4 w-4" />
        </span>
    );
}

export default function AdminNotificationDrawer({ open, onClose, onLoaded }: Props) {
    const [items, setItems] = useState<AdminNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const onLoadedRef = useRef(onLoaded);
    onLoadedRef.current = onLoaded;

    useEffect(() => {
        if (!open) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch('/admin/notifications?panel=1', {
            headers: {
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
            signal: controller.signal,
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error('Could not load notifications.');
                }

                return response.json() as Promise<{ notifications?: AdminNotification[] }>;
            })
            .then((data) => {
                setItems(data.notifications ?? []);
                onLoadedRef.current?.();
            })
            .catch((loadError: unknown) => {
                if (loadError instanceof DOMException && loadError.name === 'AbortError') {
                    return;
                }

                setError('Could not load notifications.');
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [open]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[70]">
            <button
                type="button"
                className="absolute inset-0 bg-slate-900/20"
                aria-label="Close notifications"
                onClick={onClose}
            />
            <aside
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-notification-title"
                className="absolute inset-y-0 right-0 flex w-[min(24rem,92vw)] flex-col border-l border-slate-200 bg-white shadow-2xl"
            >
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 id="admin-notification-title" className="text-sm font-black text-slate-900">
                            Notifications
                        </h2>
                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            Escalations, proof uploads, and verification alerts.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3">
                    {loading && (
                        <p className="px-2 py-8 text-center text-xs font-semibold text-slate-500">Loading alerts…</p>
                    )}
                    {!loading && error && (
                        <p className="px-2 py-8 text-center text-xs font-semibold text-rose-600">{error}</p>
                    )}
                    {!loading && !error && items.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <Bell className="mx-auto h-8 w-8 text-slate-300" />
                            <p className="mt-3 text-sm font-black text-slate-800">No alerts</p>
                            <p className="mt-1 text-xs font-semibold text-slate-500">The command center inbox is caught up.</p>
                        </div>
                    )}
                    {!loading && !error && items.length > 0 && (
                        <ul className="space-y-2">
                            {items.map((notification) => {
                                const href = destination(notification);
                                const body = (
                                    <span className="flex items-start gap-3">
                                        <NotificationIcon notification={notification} unread={!notification.read} />
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-start justify-between gap-2">
                                                <span className={cn('text-xs font-black', notification.read ? 'text-slate-700' : 'text-slate-900')}>
                                                    {notification.title}
                                                </span>
                                                <span className="shrink-0 text-[10px] font-semibold text-slate-400">{notification.sent_at}</span>
                                            </span>
                                            <span className="mt-1 block text-[11px] font-medium leading-relaxed text-slate-500">
                                                {notification.body}
                                            </span>
                                        </span>
                                    </span>
                                );

                                const className = cn(
                                    'block w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                                    notification.read
                                        ? 'border-slate-200 bg-white hover:border-sky-200'
                                        : 'border-sky-200 bg-sky-50/70 hover:border-sky-300',
                                );

                                return (
                                    <li key={notification.id}>
                                        {href ? (
                                            <button
                                                type="button"
                                                className={className}
                                                onClick={() => {
                                                    onClose();
                                                    router.visit(href);
                                                }}
                                            >
                                                {body}
                                            </button>
                                        ) : (
                                            <div className={className}>{body}</div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </aside>
        </div>
    );
}
