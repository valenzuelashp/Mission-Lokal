import { LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';

type Props = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    hint?: string;
    trend?: { value: string; positive?: boolean };
    iconClassName?: string;
};

export default function KpiCard({ label, value, icon: Icon, hint, trend, iconClassName }: Props) {
    return (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                        <p className="truncate text-[10px] font-black uppercase tracking-widest text-neutral-400">
                            {label}
                        </p>
                        <p className="text-xl font-black text-neutral-900 tracking-tight sm:text-2xl tabular-nums">
                            {value}
                        </p>
                        {trend && (
                            <p className={cn(
                                'mt-1.5 hidden items-center gap-1 text-[10px] font-black uppercase tracking-wider sm:flex',
                                trend.positive ? 'text-neutral-900' : 'text-neutral-400',
                            )}>
                                {trend.positive ? (
                                    <TrendingUp className="h-3 w-3 stroke-[2.5]" />
                                ) : (
                                    <TrendingDown className="h-3 w-3 stroke-[2.5]" />
                                )}
                                <span className="truncate">{trend.value}</span>
                            </p>
                        )}
                        {hint && !trend && (
                            <p className="mt-1 hidden truncate text-[11px] font-medium text-neutral-400 sm:block">
                                {hint}
                            </p>
                        )}
                    </div>
                    
                    <div className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-200/60 bg-neutral-50/50 text-neutral-800 shadow-2xs transition-colors sm:h-10 sm:w-10',
                        iconClassName,
                    )}>
                        <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 stroke-[2]" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}