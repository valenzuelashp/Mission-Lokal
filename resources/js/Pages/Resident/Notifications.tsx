import { Head, Link } from '@inertiajs/react';
import { Bell, FileText, ShieldAlert } from 'lucide-react';
import ResidentLayout from '@/Layouts/ResidentLayout';
import PageHeader from '@/Components/shared/PageHeader';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';

// Define the shape of our notification data
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
    return (
        <ResidentLayout>
            <Head title="Notifications" />

            <div className="mb-6">
                <PageHeader 
                    title="Notifications" 
                    description="Updates on your concerns, blotter records, and community alerts."
                />
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <EmptyState 
                        title="No notifications" 
                        description="You have no new updates at the moment."
                    >
                        <Bell className="mx-auto mt-4 h-10 w-10 text-slate-200" />
                    </EmptyState>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((notif) => {
                        // Determine where clicking this notification should take the resident
                        let href = null;
                        let Icon = Bell; // Default icon

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
                                    "transition-colors shadow-sm",
                                    !notif.read ? "border-primary/30 bg-primary/5" : "bg-white hover:bg-slate-50"
                                )}
                            >
                                <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                                    <div className={cn(
                                        "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                                        !notif.read ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500"
                                    )}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={cn(
                                                "text-sm font-semibold",
                                                !notif.read ? "text-slate-900" : "text-slate-700"
                                            )}>
                                                {notif.title}
                                            </p>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {notif.sent_at}
                                            </span>
                                        </div>
                                        <p className={cn(
                                            "text-sm",
                                            !notif.read ? "text-slate-800" : "text-muted-foreground"
                                        )}>
                                            {notif.body}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );

                        // If it has an href, wrap it in a Link; otherwise just render the card
                        return href ? (
                            <Link key={notif.id} href={href} className="block">
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