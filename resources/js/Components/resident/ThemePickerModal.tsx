import { Palette, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { RESIDENT_THEMES, getResidentTheme, setResidentTheme, type ResidentThemeId } from '@/Lib/residentThemes';
import { Button } from '@/Components/ui/button';

export default function ThemePickerModal() {
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
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-xl text-slate-600 hover:bg-slate-100 hover:text-blue-700 transition-colors cursor-pointer"
                title="Customize Portal Color Palette"
            >
                <Palette className="h-5 w-5" />
            </Button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 text-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Select Palette</h4>
                            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Resident UI</span>
                        </div>
                        <div className="space-y-1.5">
                            {(Object.values(RESIDENT_THEMES)).map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => selectTheme(t.id)}
                                    className={`flex w-full items-center justify-between rounded-xl p-2.5 text-xs font-bold transition-all cursor-pointer ${
                                        currentTheme === t.id 
                                            ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs' 
                                            : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-4 w-4 rounded-full border border-white shadow-xs" style={{ backgroundColor: t.previewColor }} />
                                        <span>{t.name}</span>
                                    </div>
                                    {currentTheme === t.id && <Check className="h-4 w-4 text-blue-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}