import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <>
            <div className="hidden w-full lg:grid lg:grid-cols-[1fr_min(680px,100%)_1fr]">
                <aside className="sticky top-[3.75rem] h-fit w-full max-w-[360px] justify-self-start pl-4 xl:pl-8">
                    <ResidentShortcuts />
                </aside>

                <div className="min-w-0 space-y-4 px-2">{children}</div>

                <aside className="sticky top-[3.75rem] h-fit w-full max-w-[360px] justify-self-end space-y-4 pr-4 xl:pr-8">
                    {right}
                </aside>
            </div>

            <div className="space-y-4 lg:hidden">
                {children}
                {right && <div className="space-y-4">{right}</div>}
            </div>
        </>
    );
}
