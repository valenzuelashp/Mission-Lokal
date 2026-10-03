import { Bot, CheckCircle2, Radio, User, Activity } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/Lib/utils';
import type { AdminActivity } from '@/Types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

const iconMap = {
    user: User,
    ai: Bot,
    success: CheckCircle2,
    system: Radio,
};

type Props = {
    activities: AdminActivity[];
    className?: string;
};

export default function ActivityFeed({ activities, className }: Props) {
    return (
        <Card className={cn('shadow-sm border-slate-200/80 bg-white flex flex-col', className)}>
            <CardHeader className="border-b border-slate-100 px-5 py-4 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-700">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Live Activity Stream
                </CardTitle>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardHeader>
            <CardContent className="p-0 flex-1">
                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto lg:max-h-none">
                    {activities.length === 0 ? (
                        <p className="p-6 text-center text-xs text-muted-foreground">No recent activity logged.</p>
                    ) : (
                        activities.map((item) => {
                            const Icon = iconMap[item.icon] ?? Radio;
                            return (
                                <li key={item.id} className="flex gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-slate-900 leading-snug">{item.title}</p>
                                        <p className="mt-0.5 text-[11px] font-medium text-slate-400">{item.time}</p>
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </CardContent>
            <div className="border-t border-slate-100 p-3.5 bg-slate-50/50 text-right">
                <Link href="/admin/audit" className="text-xs font-extrabold uppercase tracking-wide text-blue-700 hover:underline">
                    View full audit logs →
                </Link>
            </div>
        </Card>
    );
}