import { Head, Link } from '@inertiajs/react';
import EmptyState from '@/Components/shared/EmptyState';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import PersonnelLayout from '@/Layouts/PersonnelLayout';
import type { PersonnelNotification, PersonnelNotificationsPageProps } from '@/Types';

const demoNotifications: PersonnelNotification[] = [
    {
        id: 'n1',
        title: 'New mission assigned',
        body: 'MS-8888 Illegal dumping cleanup — due Jun 19, 3:00 PM.',
        sent_at: '2 hours ago',
        read: false,
        mission_id: 'MS-8888',
    },
    {
        id: 'n2',
        title: 'ACK reminder',
        body: 'MS-8880 VAWC welfare check is overdue for acknowledgment.',
        sent_at: '5 hours ago',
        read: false,
        mission_id: 'MS-8880',
    },
];

export default function Notifications(props: Partial<PersonnelNotificationsPageProps>) {
    const notifications = props.notifications ?? demoNotifications;

    return (
        <PersonnelLayout title="Mission-Lokal Personnel: Notifications">
            <Head title="Notifications" />

            <div className="mb-4 sm:mb-6">
                <h2 className="text-xl font-semibold text-blue-900 sm:text-2xl">Notifications</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    SMS and in-app alerts for your assignments
                </p>
            </div>

            {notifications.length === 0 ? (
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <EmptyState title="No notifications" description="You're all caught up." />
                </div>
            ) : (
                <>
                    <div className="space-y-3 md:hidden">
                        {notifications.map((item) => (
                            <Card
                                key={item.id}
                                className={`shadow-sm ${!item.read ? 'border-blue-200 bg-blue-50/40' : ''}`}
                            >
                                <CardContent className="space-y-2 p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="font-medium leading-snug">{item.title}</p>
                                        {!item.read && <Badge className="shrink-0 bg-red-600">New</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{item.body}</p>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs text-muted-foreground">{item.sent_at}</span>
                                        {item.mission_id && (
                                            <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                                <Link href={`/personnel/missions/${item.mission_id}`}>Open mission</Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <section className="hidden rounded-lg border bg-card shadow-sm md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3">Alert</th>
                                        <th className="px-4 py-3">Message</th>
                                        <th className="px-4 py-3">When</th>
                                        <th className="px-4 py-3">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`border-b last:border-0 hover:bg-muted/20 ${!item.read ? 'bg-blue-50/50' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.title}</span>
                                                    {!item.read && <Badge className="bg-red-600">New</Badge>}
                                                </div>
                                            </td>
                                            <td className="max-w-md px-4 py-3 text-muted-foreground">{item.body}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                                                {item.sent_at}
                                            </td>
                                            <td className="px-4 py-3">
                                                {item.mission_id ? (
                                                    <Button variant="ghost" className="h-auto p-0 text-blue-700 hover:bg-transparent" asChild>
                                                        <Link href={`/personnel/missions/${item.mission_id}`}>Open</Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </PersonnelLayout>
    );
}
