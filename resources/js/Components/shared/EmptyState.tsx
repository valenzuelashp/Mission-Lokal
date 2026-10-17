import { PropsWithChildren } from 'react';
import { Inbox } from 'lucide-react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
    className?: string;
}>;

export default function EmptyState({ title, description, children, className }: Props) {
    const theme = useResidentTheme();

    return (
        <div className={cn(`flex flex-col items-center justify-center rounded-3xl border border-dashed ${theme.cardBorder} ${theme.cardBg} py-20 px-6 text-center shadow-2xs`, className)}>
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} mb-4 border shadow-2xs`}>
                <Inbox className="h-7 w-7" />
            </div>
            <p className={cn('font-black text-base', theme.textMain)}>{title}</p>
            {description && <p className={cn('mt-1.5 max-w-sm text-xs leading-relaxed font-semibold', theme.textMuted)}>{description}</p>}
            {children && <div className="mt-6">{children}</div>}
        </div>
    );
}