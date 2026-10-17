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
        <ResidentLayout wide>
            <Head title="Notifications" />

            <div className="w-full space-y-6 pb-16">
                <div className="mb-2">
                    <PageHeader 
                        title="Resident Notifications Inbox" 
                        description="Real-time updates regarding your community concern reports, blotter cases, and barangay notices." 
                    />
                </div>

                {notifications.length === 0 ? (
                    <div className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-6 shadow-2xs`}>
                        <EmptyState 
                            title="No Notifications Found" 
                            description="You have no unread community alerts at the moment."
                        >
                            <Bell className="mx-auto mt-4 h-10 w-10 text-slate-300 animate-pulse" />
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
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
                                        "transition-all shadow-2xs rounded-3xl overflow-hidden",
                                        theme.cardBorder,
                                        theme.cardBg,
                                        !notif.read ? "border-blue-300 bg-blue-50/40 font-semibold" : ""
                                    )}
                                >
                                    <CardContent className="flex items-start gap-4 p-5 sm:p-6">
                                        <div className={cn(
                                            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-bold shadow-2xs border",
                                            !notif.read ? `${theme.primaryBg} text-white` : "bg-slate-100 text-slate-600 border-slate-200"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className={`text-sm font-black ${theme.textMain}`}>
                                                    {notif.title}
                                                </p>
                                                <span className={`shrink-0 text-xs font-semibold ${theme.textMuted}`}>
                                                    {notif.sent_at}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                !notif.read ? `font-medium ${theme.textMain}` : theme.textMuted
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
            </div>
        </ResidentLayout>
    );
}