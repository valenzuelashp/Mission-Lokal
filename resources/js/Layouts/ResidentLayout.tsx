import { PropsWithChildren } from 'react';
import ResidentHeader from '@/Components/resident/ResidentHeader';
import MobileBottomNav from '@/Components/shared/MobileBottomNav';
import { cn } from '@/Lib/utils';

type Props = PropsWithChildren<{
    wide?: boolean;
}>;

export default function ResidentLayout({ children, wide = false }: Props) {
    return (
        <div className="min-h-screen bg-[#f0f2f5] text-slate-900 selection:bg-slate-200">
            <ResidentHeader />
            <main
                className={cn(
                    'w-full px-0 py-0 sm:px-4 sm:py-4 pb-24 lg:pb-6',
                    !wide && 'mx-auto max-w-2xl',
                )}
            >
                {children}
            </main>
            <MobileBottomNav />
        </div>
    );
}