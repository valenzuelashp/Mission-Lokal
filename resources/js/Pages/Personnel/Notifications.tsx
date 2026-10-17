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

            <div className="w-full space-y-6 pb-16 max-w-4xl mx-auto">
                <PageHeader 
                    title="Field Notifications Inbox" 
                    description="SMS mirrors, emergency alerts, and mission assignment dispatches."
                />

                {notifications.length === 0 ? (
                    <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xs">
                        <EmptyState 
                            title="No Alerts" 
                            description="Your field notification inbox is fully up to date."
                        >
                            <Bell className="mx-auto mt-4 h-12 w-12 text-slate-300 animate-pulse" />
                        </EmptyState>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {notifications.map((item) => {
                            let href = item.mission_id ? `/personnel/missions/${item.mission_id}` : null;
                            let Icon = ClipboardList;

                            const content = (
                                <Card 
                                    className={cn(
                                        "transition-all shadow-2xs rounded-3xl border-slate-200/80 hover:border-blue-300 overflow-hidden",
                                        !item.read ? "border-blue-200 bg-blue-50/40 font-semibold" : "bg-white"
                                    )}
                                >
                                    <CardContent className="flex items-start gap-4 p-5 sm:p-6">
                                        <div className={cn(
                                            "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black shadow-2xs border",
                                            !item.read ? "bg-blue-700 text-white border-blue-600" : "bg-slate-100 text-slate-600 border-slate-200"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className={cn(
                                                    "text-sm font-black",
                                                    !item.read ? "text-slate-900" : "text-slate-800"
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