import { Head, Link } from '@inertiajs/react';
import { Bell, FileText, ClipboardList, CheckSquare } from 'lucide-react';
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
    registration_id?: string | null;
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
                    description="System notifications, unacknowledged mission escalations, and new proof uploads."
                />

                {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <EmptyState 
                            title="No Alerts" 
                            description="The command center notification inbox is all caught up."
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
                                href = `/admin/reports/${notif.concern_id}`;
                                Icon = FileText;
                            } else if (notif.mission_id) {
                                href = `/admin/missions/${notif.mission_id}`;
                                Icon = ClipboardList;
                            } else if (notif.registration_id) {
                                href = `/admin/verifications/${notif.registration_id}`;
                                Icon = CheckSquare;
                            }

                            const content = (
                                <Card 
                                    className={cn(
                                        "transition-all shadow-xs rounded-2xl border-slate-200/80 hover:border-blue-300",
                                        !notif.read ? "border-blue-200 bg-blue-50/40 font-semibold" : "bg-white"
                                    )}
                                >
                                    <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                                        <div className={cn(
                                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs border",
                                            !notif.read ? "bg-blue-600 text-white border-blue-500" : "bg-slate-100 text-slate-600 border-slate-200"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    !notif.read ? "text-slate-900" : "text-slate-700"
                                                )}>
                                                    {notif.title}
                                                </p>
                                                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                                                    {notif.sent_at}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                !notif.read ? "text-slate-800 font-medium" : "text-muted-foreground"
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
        </AdminLayout>
    );
}