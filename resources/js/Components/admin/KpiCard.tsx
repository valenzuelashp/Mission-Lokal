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
        <Card className="shadow-sm">
            <CardContent className="p-3 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                            {label}
                        </p>
                        <p className="mt-1 text-xl font-bold text-blue-700 sm:mt-2 sm:text-3xl">{value}</p>
                        {trend && (
                            <p
                                className={cn(
                                    'mt-1 hidden items-center gap-1 text-xs font-medium sm:flex',
                                    trend.positive ? 'text-emerald-600' : 'text-red-600',
                                )}
                            >
                                {trend.positive ? (
                                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                                )}
                                <span className="truncate">{trend.value}</span>
                            </p>
                        )}
                        {hint && !trend && (
                            <p className="mt-1 hidden truncate text-xs text-muted-foreground sm:block">{hint}</p>
                        )}
                    </div>
                    <div
                        className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 sm:h-10 sm:w-10',
                            iconClassName,
                        )}
                    >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
