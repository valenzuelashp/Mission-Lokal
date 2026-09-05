import { PropsWithChildren } from 'react';
import ResidentHeader from '@/Components/resident/ResidentHeader';
import MobileBottomNav from '@/Components/shared/MobileBottomNav';
import { cn } from '@/Lib/utils';

type Props = PropsWithChildren<{
    wide?: boolean;
}>;

export default function ResidentLayout({ children, wide = false }: Props) {
    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <ResidentHeader />
            <main
                className={cn(
                    'w-full px-4 py-4 pb-20 lg:pb-6',
                    !wide && 'mx-auto max-w-6xl',
                )}
            >
                {children}
            </main>
            <MobileBottomNav />
        </div>
    );
}
