import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <>
            <div className="hidden w-full lg:grid lg:grid-cols-[280px_min(640px,100%)_280px] xl:grid-cols-[320px_min(680px,100%)_320px] justify-center gap-6 py-6">
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