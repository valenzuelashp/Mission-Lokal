import { Head, Link } from '@inertiajs/react';
import { Bell, FileText, ShieldAlert } from 'lucide-react';
import ResidentLayout from '@/Layouts/ResidentLayout';
import PageHeader from '@/Components/shared/PageHeader';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent } from '@/Components/ui/card';
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
        <ResidentLayout>
            <Head title="Notifications" />

            <div className="mb-6">
                <PageHeader 
                    title="Resident Notifications Inbox" 
                    description="Real-time updates regarding your community concern reports, blotter cases, and barangay notices." 
                />
            </div>

            {notifications.length === 0 ? (
                <div className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-6 shadow-xs`}>
                    <EmptyState 
                        title="No Notifications Found" 
                        description="You have no unread community alerts at the moment."
                    >
                        <Bell className="mx-auto mt-4 h-10 w-10 text-slate-300 animate-pulse" />
                    </EmptyState>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((notif) => {
                        let href = null;
                        let Icon = Bell;

                        if (notif.concern_id) {
                            href = `/concerns/${notif.concern_id}`;
                            Icon = FileText;
                        } else if (notif.blotter_id) {
                            href = `/blotters`; 
                            Icon = ShieldAlert;
                        }

                        const content = (
                            <Card 
                                className={cn(
                                    "transition-all shadow-xs rounded-2xl",
                                    theme.cardBorder,
                                    theme.cardBg,
                                    !notif.read ? "border-blue-300 bg-blue-50/40 font-semibold" : ""
                                )}
                            >
                                <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                                    <div className={cn(
                                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs border",
                                        !notif.read ? `${theme.primaryBg} text-white` : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-bold",
                                                !notif.read ? "" : ""
                                            )}>
                                                {notif.title}
                                            </p>
                                            <span className={`shrink-0 text-xs font-semibold ${theme.textMuted}`}>
                                                {notif.sent_at}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-xs leading-relaxed",
                                            !notif.read ? "font-medium" : theme.textMuted
                                        )}>
                                            {notif.body}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );

                        return href ? (
                            <Link key={notif.id} href={href} className="block group">
                                {content}
                            </Link>
                        ) : (
                            <div key={notif.id}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            )}
        </ResidentLayout>
    );
}