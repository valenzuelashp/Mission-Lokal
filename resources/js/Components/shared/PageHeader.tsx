import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
    action?: React.ReactNode;
}>;

export default function PageHeader({ title, description, action, children }: Props) {
    return (
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 lg:mb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
                <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl lg:text-3xl">{title}</h1>
                {description && (
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground lg:text-base">{description}</p>
                )}
                {children}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
