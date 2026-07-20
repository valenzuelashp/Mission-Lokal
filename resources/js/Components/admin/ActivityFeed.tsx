import { Bot, CheckCircle2, Radio, User } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/Lib/utils';
import type { AdminActivity } from '@/Types';

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
        <div className={cn('flex flex-col rounded-2xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden', className)}>
            <div className="border-b border-neutral-100 bg-white/40 px-4 py-3.5">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800">Activity feed</h3>
            </div>
            <ul className="max-h-72 flex-1 divide-y divide-neutral-100 overflow-y-auto lg:max-h-none">
                {activities.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                        <li key={item.id} className="flex gap-3.5 px-4 py-3.5 transition-colors hover:bg-neutral-50/40">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-xs">
                                <Icon className="h-4 w-4 stroke-[2]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold leading-snug text-neutral-800 tracking-tight">{item.title}</p>
                                <p className="mt-1 text-[10px] font-medium text-neutral-400 tabular-nums">{item.time}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <div className="border-t border-neutral-100 bg-white/30 p-3.5">
                <Link href="/admin/audit" className="inline-flex text-[11px] font-black uppercase tracking-widest text-neutral-900 border-b border-neutral-900/30 pb-0.5 hover:border-neutral-900 transition-colors">
                    View all logs
                </Link>
            </div>
        </div>
    );
}