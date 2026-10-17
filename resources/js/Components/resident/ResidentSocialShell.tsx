import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <div className="w-full">
            <div className="hidden w-full lg:grid lg:grid-cols-[280px_minmax(0,1fr)_320px] xl:grid-cols-[300px_minmax(0,1fr)_340px] justify-center gap-6 py-6 xl:gap-8 xl:py-8">
                <aside className="sticky top-[5rem] h-fit w-full">
                    <ResidentShortcuts />
                </aside>

                <main className="min-w-0 space-y-6 w-full">{children}</main>

                <aside className="sticky top-[5rem] h-fit w-full space-y-6">
                    {right}
                </aside>
            </div>

            <main className="mx-auto w-full space-y-6 py-4 lg:hidden">
                {children}
                {right && <div className="space-y-6">{right}</div>}
            </main>
        </div>
    );
}