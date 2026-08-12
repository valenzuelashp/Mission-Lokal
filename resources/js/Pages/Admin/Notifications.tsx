import { Head, Link } from '@inertiajs/react';
import { Bell, FileText, ClipboardList } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import PageHeader from '@/Components/shared/PageHeader';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';

interface Notification {
    id: string;
    title: string;
    body: string;
    sent_at: string;
    read: boolean;
    concern_id: string | null;
    mission_id: string | null;
}

interface Props {
    notifications: Notification[];
}

export default function Notifications({ notifications }: Props) {
    return (
        <AdminLayout title="Command Center: Notifications">
            <Head title="Notifications" />

            <div className="mx-auto max-w-4xl">
                <PageHeader 
                    title="Command Center Alerts" 
                    description="System notifications, unacknowledged missions, and new proof uploads."
                />

                {notifications.length === 0 ? (
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <EmptyState 
                            title="No alerts" 
                            description="The command center is all caught up."
                        >
                            <Bell className="mx-auto mt-4 h-10 w-10 text-slate-200" />
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map((notif) => {
                            // Determine where the admin should be redirected when clicking
                            let href = null;
                            let Icon = Bell;

                            if (notif.concern_id) {
                                href = `/admin/reports/${notif.concern_id}`;
                                Icon = FileText;
                            } else if (notif.mission_id) {
                                href = `/admin/missions/${notif.mission_id}`;
                                Icon = ClipboardList;
                            }

                            const content = (
                                <Card 
                                    className={cn(
                                        "transition-colors shadow-sm",
                                        !notif.read ? "border-blue-200 bg-blue-50/40" : "bg-white hover:bg-slate-50"
                                    )}
                                >
                                    <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                                        <div className={cn(
                                            "mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                                            !notif.read ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
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
            </div>
        </AdminLayout>
    );
}