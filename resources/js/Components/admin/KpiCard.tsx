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
        <Card className="shadow-xs border-slate-200/80 bg-white hover:border-blue-300 transition-all duration-200">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-black uppercase tracking-widest text-slate-500">
                            {label}
                        </p>
                        <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">{value}</p>
                        {trend && (
                            <p
                                className={cn(
                                    'mt-2 hidden items-center gap-1.5 text-xs font-bold sm:flex',
                                    trend.positive ? 'text-emerald-600' : 'text-rose-600',
                                )}
                            >
                                {trend.positive ? (
                                    <TrendingUp className="h-4 w-4 shrink-0" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 shrink-0" />
                                )}
                                <span className="truncate">{trend.value}</span>
                            </p>
                        )}
                        {hint && !trend && (
                            <p className="mt-1.5 hidden truncate text-xs text-muted-foreground font-medium sm:block">{hint}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs',
                            iconClassName,
                        )}
                    >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}