import { Head, Link } from '@inertiajs/react';
import { Bell, ClipboardList } from 'lucide-react';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import PageHeader from '@/Components/shared/PageHeader';
import EmptyState from '@/Components/shared/EmptyState';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';
import type { PersonnelNotificationsPageProps } from '@/Types';

export default function Notifications({ notifications = [] }: Partial<PersonnelNotificationsPageProps>) {
    return (
        <PersonnelLayout title="Mission-Lokal Personnel: Notifications">
            <Head title="Personnel Notifications" />

            <div className="mx-auto max-w-4xl">
                <PageHeader 
                    title="Field Notifications Inbox" 
                    description="SMS mirrors, emergency alerts, and mission assignment dispatches."
                />

                {notifications.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <EmptyState 
                            title="No Alerts" 
                            description="Your field notification inbox is fully up to date."
                        >
                            <Bell className="mx-auto mt-4 h-10 w-10 text-slate-300 animate-pulse" />
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map((item) => {
                            let href = item.mission_id ? `/personnel/missions/${item.mission_id}` : null;
                            let Icon = ClipboardList;

                            const content = (
                                <Card 
                                    className={cn(
                                        "transition-all shadow-xs rounded-2xl border-slate-200/80 hover:border-emerald-300",
                                        !item.read ? "border-emerald-200 bg-emerald-50/40 font-semibold" : "bg-white"
                                    )}
                                >
                                    <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                                        <div className={cn(
                                            "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold shadow-2xs border",
                                            !item.read ? "bg-emerald-600 text-white border-emerald-500" : "bg-slate-100 text-slate-600 border-slate-200"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    !item.read ? "text-slate-900" : "text-slate-700"
                                                )}>
                                                    {item.title}
                                                </p>
                                                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                                                    {item.sent_at}
                                                </span>
                                            </div>
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                !item.read ? "text-slate-800 font-medium" : "text-muted-foreground"
                                            )}>
                                                {item.body}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );

                            return href ? (
                                <Link key={item.id} href={href} className="block group">
                                    {content}
                                </Link>
                            ) : (
                                <div key={item.id}>
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PersonnelLayout>
    );
}