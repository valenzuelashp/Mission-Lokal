import { PropsWithChildren, ReactNode } from 'react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
    action?: ReactNode;
}>;

export default function PageHeader({ title, description, action, children }: Props) {
    const theme = useResidentTheme();

    return (
        <div className={`mb-8 flex flex-col gap-4 sm:mb-10 lg:flex-row lg:items-end lg:justify-between border-b ${theme.dividerColor} pb-6`}>
            <div className="min-w-0 flex-1">
                <h1 className={`break-words text-2xl font-black tracking-tight ${theme.textMain} sm:text-4xl`}>{title}</h1>
                {description && (
                    <p className={`mt-2 max-w-3xl text-xs sm:text-sm font-medium ${theme.textMuted} leading-relaxed`}>{description}</p>
                )}
                {children}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}