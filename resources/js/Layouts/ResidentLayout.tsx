import { PropsWithChildren, useState, useEffect, createContext, useContext } from 'react';
import ResidentHeader from '@/Components/resident/ResidentHeader';
import MobileBottomNav from '@/Components/shared/MobileBottomNav';
import FlashToasts from '@/Components/shared/FlashToasts';
import PasswordPromptModal from '@/Pages/Auth/PasswordPromptModal';
import { getResidentTheme, type ResidentTheme } from '@/Lib/residentThemes';
import { cn } from '@/Lib/utils';

const ThemeContext = createContext<ResidentTheme>(getResidentTheme());
export const useResidentTheme = () => useContext(ThemeContext);

type Props = PropsWithChildren<{
    wide?: boolean;
}>;

export default function ResidentLayout({ children, wide = false }: Props) {
    const [theme, setTheme] = useState<ResidentTheme>(() => getResidentTheme());

    useEffect(() => {
        const handleSync = () => setTheme(getResidentTheme());
        window.addEventListener('resident-theme-change', handleSync);
        return () => window.removeEventListener('resident-theme-change', handleSync);
    }, []);

    return (
        <ThemeContext.Provider value={theme}>
            <div className={cn("min-h-screen transition-colors duration-300", theme.bgMain, theme.textMain)}>
                <FlashToasts />
                <PasswordPromptModal />
                <ResidentHeader />
                <main
                    className={cn(
                        'w-full px-3 py-4 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:pb-8 animate-fade-in',
                        !wide && 'mx-auto max-w-3xl md:max-w-4xl lg:max-w-6xl',
                    )}
                >
                    {children}
                </main>
                <MobileBottomNav />
            </div>
        </ThemeContext.Provider>
    );
}