import { PropsWithChildren, ReactNode } from 'react';
import ResidentShortcuts from '@/Components/resident/ResidentShortcuts';

type Props = PropsWithChildren<{
    right?: ReactNode;
}>;

export default function ResidentSocialShell({ children, right }: Props) {
    return (
        <>
            {/* Desktop Full-Bleed Adaptive Framework Split */}
            <div className="hidden lg:grid lg:grid-cols-[250px_1fr_300px] gap-5 items-start py-2">
                <aside className="sticky top-[4.5rem] h-fit w-full">
                    <ResidentShortcuts />
                </aside>

                <div className="min-w-0 space-y-3">
                    {children}
                </div>

                <aside className="sticky top-[4.5rem] h-fit w-full space-y-3">
                    {right}
                </aside>
            </div>

            {/* Mobile Native Social App Stack Stream Layout */}
            <div className="space-y-2 lg:hidden w-full max-w-md mx-auto">
                <div className="space-y-2 w-full">
                    {children}
                </div>
                {right && (
                    <div className="space-y-2 pt-2 px-2 sm:px-0">
                        {right}
                    </div>
                )}
            </div>
        </>
    );
}