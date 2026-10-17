import { Palette, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RESIDENT_THEMES, getResidentTheme, setResidentTheme, type ResidentThemeId } from '@/Lib/residentThemes';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function ThemePickerModal() {
    const theme = useResidentTheme();
    const [currentTheme, setCurrentTheme] = useState<ResidentThemeId>(() => getResidentTheme().id);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleSync = () => setCurrentTheme(getResidentTheme().id);
        window.addEventListener('resident-theme-change', handleSync);
        return () => window.removeEventListener('resident-theme-change', handleSync);
    }, []);

    const selectTheme = (id: ResidentThemeId) => {
        setResidentTheme(id);
        setCurrentTheme(id);
        setIsOpen(false);
        // Performs a clean browser refresh to guarantee 100% component sync across the portal
        window.location.reload();
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={`rounded-2xl h-11 w-11 ${theme.textMuted} hover:${theme.badgeBg} hover:opacity-100 transition-colors cursor-pointer`}
                title="Customize Portal Color Palette"
            >
                <Palette className="h-5 w-5" />
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute right-0 top-14 z-50 w-64 rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95`}>
                        <div className={`flex items-center justify-between border-b ${theme.dividerColor} pb-3`}>
                            <h4 className={`text-xs font-black uppercase tracking-wider ${theme.textMain}`}>Select Palette</h4>
                            <span className={`text-[10px] font-black ${theme.primaryText} ${theme.badgeBg} px-2.5 py-1 rounded-xl border ${theme.badgeBorder}`}>Resident UI</span>
                        </div>
                        <div className="space-y-2">
                            {(Object.values(RESIDENT_THEMES)).map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => selectTheme(t.id)}
                                    className={`flex w-full items-center justify-between rounded-2xl p-3 text-xs font-black transition-all cursor-pointer border ${
                                        currentTheme === t.id 
                                            ? `${theme.badgeBg} ${theme.primaryText}${theme.badgeBorder} shadow-2xs` 
                                            : `${theme.cardBg}${theme.textMuted} hover:${theme.badgeBg}${theme.cardBorder}`
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.previewColor }} />
                                        <span>{t.name}</span>
                                    </div>
                                    {currentTheme === t.id && <Check className={`h-4 w-4 ${theme.primaryText}`} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}