import { PropsWithChildren, useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import ResidentHeader from '@/Components/resident/ResidentHeader';
import ResidentNotificationDrawer from '@/Components/resident/ResidentNotificationDrawer';
import MobileBottomNav from '@/Components/shared/MobileBottomNav';
import FlashToasts from '@/Components/shared/FlashToasts';
import PasswordPromptModal from '@/Pages/Auth/PasswordPromptModal';
import { useResidentTheme } from '@/Layouts/ResidentThemeContext';
import { cn } from '@/Lib/utils';
import type { PageProps } from '@/Types';

export { useResidentTheme, ResidentThemeProvider } from '@/Layouts/ResidentThemeContext';

type Props = PropsWithChildren<{
    wide?: boolean;
}>;

export default function ResidentLayout({ children, wide = false }: Props) {
    const theme = useResidentTheme();
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [clearedUnread, setClearedUnread] = useState(false);
    const { unread_count } = usePage<PageProps & { unread_count?: number }>().props;
    const serverUnread = Number(unread_count ?? 0);
    const unread = clearedUnread ? 0 : serverUnread;

    useEffect(() => {
        setClearedUnread(false);
    }, [serverUnread]);

    return (
        <div className={cn("min-h-screen transition-colors duration-300", theme.bgMain, theme.textMain)}>
                <FlashToasts />
                <PasswordPromptModal />
                <ResidentHeader unreadCount={unread} onNotificationsClick={() => setNotificationsOpen(true)} />
                <main
                    className={cn(
                        'w-full px-3 -mt-2 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:px-4 sm:-mt-3 md:px-6 md:-mt-3 lg:px-8 xl:pb-4 animate-fade-in',
                        !wide && 'mx-auto max-w-3xl md:max-w-4xl lg:max-w-6xl',
                    )}
                >
                    {children}
                </main>
                <MobileBottomNav />
                <ResidentNotificationDrawer
                    open={notificationsOpen}
                    onClose={() => setNotificationsOpen(false)}
                    onLoaded={() => setClearedUnread(true)}
                />
        </div>
    );
}