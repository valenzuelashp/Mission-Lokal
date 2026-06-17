import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
}>;

export default function EmptyState({ title, description, children }: Props) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
            <p className="font-medium">{title}</p>
            {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
            {children && <div className="mt-4">{children}</div>}
        </div>
    );
}
