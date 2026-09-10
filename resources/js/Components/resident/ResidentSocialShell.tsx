import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <>
            <div className="hidden w-full lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,680px)_minmax(0,1fr)] justify-center gap-6 py-6">
                <aside className="sticky top-[4.5rem] h-fit w-full">
                    <ResidentShortcuts />
                </aside>

                <main className="min-w-0 space-y-4">{children}</main>

                <aside className="sticky top-[4.5rem] h-fit w-full space-y-4">
                    {right}
                </aside>
            </div>

            <main className="space-y-4 py-4 lg:hidden px-4">
                {children}
                {right && <div className="space-y-4">{right}</div>}
            </main>
        </>
    );
}