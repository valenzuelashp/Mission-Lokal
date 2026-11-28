import { Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';

export function applyStoredTheme() {
    const admin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
    const stored = localStorage.getItem(admin ? 'mission-lokal-admin-theme' : 'mission-lokal-theme');
    const theme = stored === 'dark'
        || (!admin && !stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'dark'
        : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
}

export default function ThemeToggle({ className = '' }: { className?: string }) {
    const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle('dark', next);
        const admin = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/');
        localStorage.setItem(admin ? 'mission-lokal-admin-theme' : 'mission-lokal-theme', next ? 'dark' : 'light');
    };

    return (
        <Button type="button" variant="outline" size="icon" onClick={toggle}
            className={`rounded-2xl border-slate-200/80 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </Button>
    );
}
