import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
    action?: React.ReactNode;
}>;

export default function PageHeader({ title, description, action, children }: Props) {
    return (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
                {children}
            </div>
            {action}
        </div>
    );
}
