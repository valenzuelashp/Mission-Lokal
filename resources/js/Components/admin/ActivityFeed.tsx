import { Bot, CheckCircle2, Radio, User } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { AdminActivity } from '@/Types';

const iconMap = {
    user: User,
    ai: Bot,
    success: CheckCircle2,
    system: Radio,
};

type Props = {
    activities: AdminActivity[];
};

export default function ActivityFeed({ activities }: Props) {
    return (
        <div className="flex h-full flex-col rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity feed</h3>
            </div>
            <ul className="flex-1 divide-y">
                {activities.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                        <li key={item.id} className="flex gap-3 px-4 py-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-snug">{item.title}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{item.time}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <div className="border-t p-3">
                <Link href="/admin/audit" className="text-xs font-semibold uppercase tracking-wide text-blue-700 hover:underline">
                    View all logs
                </Link>
            </div>
        </div>
    );
}
