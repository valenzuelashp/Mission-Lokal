import { Head } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

type StubPageProps = PropsWithChildren<{
    title: string;
    description?: string;
}>;

export default function StubPage({ title, description, children }: StubPageProps) {
    return (
        <>
            <Head title={title} />
            {children ?? (
                <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center">
                    <h1 className="text-xl font-semibold">{title}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {description ?? 'Screen stub — implement per docs/TASKS.md'}
                    </p>
                </div>
            )}
        </>
    );
}
