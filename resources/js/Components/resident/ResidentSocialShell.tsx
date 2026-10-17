import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <>
            <div className="hidden w-full lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,260px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,640px)_minmax(0,1fr)] justify-center gap-5 py-4 xl:gap-8 xl:py-6">
                <aside className="sticky top-[5rem] h-fit w-full">
                    <ResidentShortcuts />
                </aside>

                <main className="min-w-0 space-y-5">{children}</main>

                <aside className="sticky top-[5rem] h-fit w-full space-y-5">
                    {right}
                </aside>
            </div>

            <main className="mx-auto w-full max-w-2xl space-y-4 py-1 md:max-w-3xl md:space-y-5 md:py-2 lg:hidden">
                {children}
                {right && <div className="space-y-4 md:space-y-5">{right}</div>}
            </main>
        </>
    );
}