import { router } from '@inertiajs/react';
import { Bell, FileText, ShieldAlert, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/Lib/utils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type ResidentNotification = {
    id: string;
    title: string;
    body: string;
    sent_at: string;
    read: boolean;
    concern_id: string | null;
    blotter_id: string | null;
};

type Props = {
    open: boolean;
    onClose: () => void;
    onLoaded?: () => void;
};

function destination(notification: ResidentNotification): string | null {
    if (notification.concern_id) {
        return `/concerns/${notification.concern_id}`;
    }
    if (notification.blotter_id) {
        return '/blotters';
    }

    return null;
}

function NotificationIcon({ notification, unread }: { notification: ResidentNotification; unread: boolean }) {
    const theme = useResidentTheme();
    const Icon = notification.concern_id ? FileText : notification.blotter_id ? ShieldAlert : Bell;

    return (
        <span
            className={cn(
                'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                unread ? `${theme.badgeBorder} ${theme.primaryBg}` : `${theme.badgeBorder} ${theme.badgeBg} ${theme.badgeText}`,
            )}
        >
            <Icon className="h-4 w-4" />
        </span>
    );
}

export default function ResidentNotificationDrawer({ open, onClose, onLoaded }: Props) {
    const theme = useResidentTheme();
    const [items, setItems] = useState<ResidentNotification[]>([]);
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

        fetch('/notifications?panel=1', {
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

                return response.json() as Promise<{ notifications?: ResidentNotification[] }>;
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
                aria-labelledby="resident-notification-title"
                className={`absolute inset-y-0 right-0 flex w-[min(24rem,92vw)] flex-col border-l ${theme.cardBorder} ${theme.cardBg} ${theme.textMain} shadow-2xl`}
            >
                <div className={`flex items-start justify-between gap-3 border-b ${theme.dividerColor} px-5 py-4`}>
                    <div>
                        <h2 id="resident-notification-title" className={`text-sm font-black ${theme.textMain}`}>
                            Notifications
                        </h2>
                        <p className={`mt-0.5 text-[11px] font-semibold ${theme.textMuted}`}>
                            Concern updates, blotter cases, and barangay notices.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.textMuted} ${theme.hoverBg}`}
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-3">
                    {loading && (
                        <p className={`px-2 py-8 text-center text-xs font-semibold ${theme.textMuted}`}>Loading alerts…</p>
                    )}
                    {!loading && error && (
                        <p className="px-2 py-8 text-center text-xs font-semibold text-rose-600">{error}</p>
                    )}
                    {!loading && !error && items.length === 0 && (
                        <div className="px-4 py-12 text-center">
                            <Bell className={`mx-auto h-8 w-8 ${theme.primaryText}`} />
                            <p className={`mt-3 text-sm font-black ${theme.textMain}`}>No alerts</p>
                            <p className={`mt-1 text-xs font-semibold ${theme.textMuted}`}>Your inbox is caught up.</p>
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
                                                <span className={cn('text-xs font-black', notification.read ? theme.textMuted : theme.textMain)}>
                                                    {notification.title}
                                                </span>
                                                <span className={`shrink-0 text-[10px] font-semibold ${theme.textMuted}`}>{notification.sent_at}</span>
                                            </span>
                                            <span className={`mt-1 block text-[11px] font-medium leading-relaxed ${theme.textMuted}`}>
                                                {notification.body}
                                            </span>
                                        </span>
                                    </span>
                                );

                                const className = cn(
                                    'block w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                                    notification.read
                                        ? `${theme.cardBorder} ${theme.cardBg} ${theme.hoverBg}`
                                        : `${theme.badgeBorder} ${theme.accentSurface} ${theme.hoverBg}`,
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
