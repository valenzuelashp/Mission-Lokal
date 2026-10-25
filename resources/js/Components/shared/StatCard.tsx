import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/Components/ui/card';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

type Props = {
    label: string;
    value: string | number;
    icon: LucideIcon;
    hint?: string;
    className?: string;
};

export default function StatCard({ label, value, icon: Icon, hint, className }: Props) {
    const theme = useResidentTheme();

    return (
        <Card className={cn('overflow-hidden rounded-2xl shadow-2xs transition-all hover:-translate-y-0.5 hover:shadow-md sm:rounded-3xl', className)}>
            <CardContent className="flex flex-col items-start gap-2 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border shadow-2xs sm:h-12 sm:w-12 sm:rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                    <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-[9px] font-black uppercase leading-tight tracking-widest sm:truncate sm:text-[10px] ${theme.textMuted}`}>{label}</p>
                    <p className={`mt-0.5 text-lg font-black leading-tight tracking-tight sm:text-2xl ${theme.textMain}`}>{value}</p>
                    {hint && <p className={`mt-0.5 hidden truncate text-[11px] font-semibold sm:block ${theme.textMuted}`}>{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}