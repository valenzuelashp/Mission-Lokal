import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { getResidentTheme, RESIDENT_THEMES, type ResidentTheme } from '@/Lib/residentThemes';

const ThemeContext = createContext<ResidentTheme>(RESIDENT_THEMES.sapphire);

export const useResidentTheme = () => useContext(ThemeContext);

export function ResidentThemeProvider({ children }: PropsWithChildren) {
    const [theme, setTheme] = useState<ResidentTheme>(() => getResidentTheme());

    useEffect(() => {
        const handleSync = () => setTheme(getResidentTheme());
        window.addEventListener('resident-theme-change', handleSync);
        return () => window.removeEventListener('resident-theme-change', handleSync);
    }, []);

    useEffect(() => {
        const root = document.documentElement;
        const previousTheme = root.dataset.residentTheme;
        const propertyNames = [
            '--resident-scrollbar-thumb',
            '--resident-scrollbar-track',
            '--resident-scrollbar-thumb-hover',
        ];
        const previousValues = propertyNames.map((name) => root.style.getPropertyValue(name));

        root.dataset.residentTheme = theme.id;
        root.style.setProperty('--resident-scrollbar-thumb', theme.scrollbarThumb);
        root.style.setProperty('--resident-scrollbar-track', theme.scrollbarTrack);
        root.style.setProperty('--resident-scrollbar-thumb-hover', theme.scrollbarThumbHover);

        return () => {
            if (previousTheme) root.dataset.residentTheme = previousTheme;
            else delete root.dataset.residentTheme;

            propertyNames.forEach((name, index) => {
                if (previousValues[index]) root.style.setProperty(name, previousValues[index]);
                else root.style.removeProperty(name);
            });
        };
    }, [theme]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}