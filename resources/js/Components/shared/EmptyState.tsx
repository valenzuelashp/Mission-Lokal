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
        <div className={cn(`flex flex-col items-center justify-center rounded-2xl border border-dashed ${theme.cardBorder} ${theme.cardBg} py-16 px-4 text-center shadow-2xs`, className)}>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} mb-3 border`}>
                <Inbox className="h-6 w-6" />
            </div>
            <p className={cn('font-bold text-base', theme.textMain)}>{title}</p>
            {description && <p className={cn('mt-1 max-w-sm text-xs leading-relaxed font-medium', theme.textMuted)}>{description}</p>}
            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}