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
        <Card className={cn('overflow-hidden shadow-xs rounded-2xl transition-all hover:shadow-sm', className)}>
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} border shadow-2xs`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted} truncate`}>{label}</p>
                    <p className={`text-2xl font-black ${theme.textMain} tracking-tight leading-tight mt-0.5`}>{value}</p>
                    {hint && <p className={`text-[11px] font-semibold ${theme.textMuted} mt-0.5 truncate`}>{hint}</p>}
                </div>
            </CardContent>
        </Card>
    );
}