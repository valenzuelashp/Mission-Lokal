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
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                        <p className="mt-2 text-3xl font-bold text-blue-700">{value}</p>
                        {trend && (
                            <p
                                className={cn(
                                    'mt-1 flex items-center gap-1 text-xs font-medium',
                                    trend.positive ? 'text-emerald-600' : 'text-red-600',
                                )}
                            >
                                {trend.positive ? (
                                    <TrendingUp className="h-3.5 w-3.5" />
                                ) : (
                                    <TrendingDown className="h-3.5 w-3.5" />
                                )}
                                {trend.value}
                            </p>
                        )}
                        {hint && !trend && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
                    </div>
                    <div
                        className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600',
                            iconClassName,
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
