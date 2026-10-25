import { Head, Link } from '@inertiajs/react';
import { Bell, FileText, ShieldAlert } from 'lucide-react';
import ResidentLayout from '@/Layouts/ResidentLayout';
import PageHeader from '@/Components/shared/PageHeader';
import EmptyState from '@/Components/shared/EmptyState';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

interface Notification {
    id: string;
    title: string;
    body: string;
    sent_at: string;
    read: boolean;
    concern_id: string | null;
    blotter_id: string | null;
}

interface Props {
    notifications: Notification[];
}

export default function Notifications({ notifications }: Props) {
    const theme = useResidentTheme();

    return (
        <ResidentLayout wide>
            <Head title="Notifications" />

            <div className="w-full space-y-4">
                <PageHeader
                    title="Notifications"
                    description="Concern updates, blotter cases, and barangay notices."
                />

                {notifications.length === 0 ? (
                    <div className={`rounded-2xl border p-6 shadow-2xs ${theme.cardBorder} ${theme.cardBg}`}>
                        <EmptyState
                            title="No alerts"
                            description="Your inbox is caught up."
                        >
                            <Bell className="mx-auto mt-4 h-8 w-8 text-slate-300" />
                        </EmptyState>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notif) => {
                            const href = notif.concern_id
                                ? `/concerns/${notif.concern_id}`
                                : notif.blotter_id
                                  ? '/blotters'
                                  : null;
                            const Icon = notif.concern_id ? FileText : notif.blotter_id ? ShieldAlert : Bell;

                            const content = (
                                <span className="flex items-start gap-3">
                                    <span
                                        className={cn(
                                            'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
                                            !notif.read
                                                ? 'border-sky-500 bg-sky-600 text-white'
                                                : 'border-slate-200 bg-slate-100 text-slate-600',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="flex items-start justify-between gap-2">
                                            <span className={cn('text-xs font-black', notif.read ? theme.textMuted : theme.textMain)}>
                                                {notif.title}
                                            </span>
                                            <span className={`shrink-0 text-[10px] font-semibold ${theme.textMuted}`}>
                                                {notif.sent_at}
                                            </span>
                                        </span>
                                        <span className={`mt-1 block text-[11px] font-medium leading-relaxed ${theme.textMuted}`}>
                                            {notif.body}
                                        </span>
                                    </span>
                                </span>
                            );

                            const className = cn(
                                'block w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                                notif.read ? `${theme.cardBorder} ${theme.cardBg}` : 'border-sky-200 bg-sky-50/70',
                            );

                            return (
                                <li key={notif.id}>
                                    {href ? (
                                        <Link href={href} className={className}>
                                            {content}
                                        </Link>
                                    ) : (
                                        <div className={className}>{content}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </ResidentLayout>
    );
}