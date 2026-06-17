import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/Lib/utils';

type Props = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    hint?: string;
    className?: string;
};

export default function StatCard({ label, value, icon: Icon, hint, className }: Props) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold leading-tight">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
