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

            <div className="mb-6">
                <h2 className="text-xl font-black uppercase tracking-tight text-neutral-900 sm:text-2xl">Notifications</h2>
                <p className="mt-1 text-xs font-medium text-neutral-500">
                    System operations telemetry logs via standard digital protocols.
                </p>
            </div>

            {notifications.length === 0 ? (
                <div className="border border-neutral-200/60 bg-white/60 backdrop-blur-md rounded-2xl p-10 text-center shadow-sm">
                    <EmptyState title="Inbox synchronized" description="Zero active messages logged on this deployment instance." />
                </div>
            ) : (
                <>
                    <div className="space-y-3 md:hidden">
                        {notifications.map((item) => (
                            <Card
                                key={item.id}
                                className={`border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden transition-all duration-200 ${
                                    !item.read ? 'border-neutral-900 bg-white' : ''
                                }`}
                            >
                                <CardContent className="space-y-2.5 p-4">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="font-black text-sm tracking-tight text-neutral-900 leading-snug">{item.title}</p>
                                        {!item.read && <Badge className="shrink-0 bg-neutral-900 text-white rounded-md text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5">New</Badge>}
                                    </div>
                                    <p className="text-xs font-medium text-neutral-500 leading-relaxed">{item.body}</p>
                                    <div className="flex items-center justify-between pt-1 font-bold text-[10px] uppercase tracking-wider">
                                        <span className="text-neutral-400 font-medium lowercase normal-case text-xs">{item.sent_at}</span>
                                        {item.mission_id && (
                                            <Button variant="ghost" className="h-auto p-0 text-neutral-900 font-black border-b border-neutral-900/40 hover:border-neutral-900 hover:bg-transparent rounded-none text-[11px]" asChild>
                                                <Link href={`/personnel/missions/${item.mission_id}`}>Open asset</Link>
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <section className="hidden rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden md:block">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-bold tracking-tight text-neutral-700">
                                <thead>
                                    <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                        <th className="px-5 py-4">Alert Profile</th>
                                        <th className="px-5 py-4">Diagnostic Context</th>
                                        <th className="px-5 py-4">Timestamp</th>
                                        <th className="px-5 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {notifications.map((item) => (
                                        <tr
                                            key={item.id}
                                            className={`group transition-colors hover:bg-neutral-50/40 ${!item.read ? 'bg-neutral-50/20' : ''}`}
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-black text-neutral-900">{item.title}</span>
                                                    {!item.read && <Badge className="bg-neutral-900 text-white rounded-md text-[9px] font-black uppercase tracking-widest px-1.5">New</Badge>}
                                                </div>
                                            </td>
                                            <td className="max-w-md px-5 py-4 font-medium text-neutral-500 leading-relaxed">{item.body}</td>
                                            <td className="whitespace-nowrap px-5 py-4 font-medium text-neutral-400">
                                                {item.sent_at}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                {item.mission_id ? (
                                                    <Button variant="ghost" className="h-8 rounded-xl border border-neutral-200 bg-white px-3 text-[11px] font-black uppercase tracking-wider shadow-sm hover:bg-neutral-50 text-neutral-900 transition-all active:scale-95" asChild>
                                                        <Link href={`/personnel/missions/${item.mission_id}`}>Inspect</Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-neutral-300 font-light pr-4">—</span>
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