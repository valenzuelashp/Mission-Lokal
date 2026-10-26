export type ResidentThemeId = 'sapphire' | 'emerald' | 'obsidian' | 'sunset' | 'amethyst' | 'crimson';

export interface ResidentTheme {
    id: ResidentThemeId;
    name: string;
    bgMain: string;
    textMain: string;
    textMuted: string;
    cardBg: string;
    accentSurface: string;
    cardBorder: string;
    cardHoverBorder: string;
    cardGlow: string; // Dynamic colored shadow/glow
    
    primaryBg: string;
    primaryHover: string;
    primaryText: string;
    primaryBorder: string;
    
    inputBg: string;
    inputBorder: string;
    inputText: string;
    focusRing: string;
    softRing: string;
    timelineLineBg: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconColor: string;
    dividerColor: string;
    hoverBg: string;
    previewColor: string;
    logoFilter: string;
    scrollbarThumb: string;
    scrollbarTrack: string;
    scrollbarThumbHover: string;
}

export const RESIDENT_THEMES: Record<ResidentThemeId, ResidentTheme> = {
    sapphire: {
        id: 'sapphire',
        name: 'Classic Sapphire (Rich Cobalt)',
        bgMain: 'bg-[#e9f0fc] text-slate-900',
        textMain: 'text-slate-950',
        textMuted: 'text-slate-600',
        cardBg: 'bg-white text-slate-900 shadow-sm',
        accentSurface: 'bg-blue-50/70',
        cardBorder: 'border-blue-300/80',
        cardHoverBorder: 'hover:border-blue-500',
        cardGlow: 'hover:shadow-blue-500/20 hover:shadow-md',
        primaryBg: 'bg-blue-700 text-white',
        primaryHover: 'hover:bg-blue-800',
        primaryText: 'text-blue-700',
        primaryBorder: 'border-blue-300',
        inputBg: 'bg-blue-50/50 focus:bg-white',
        inputBorder: 'border-blue-300',
        inputText: 'text-slate-950',
        focusRing: 'focus:ring-blue-600 focus-visible:ring-blue-600',
        softRing: 'ring-blue-100',
        timelineLineBg: 'before:bg-blue-200',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-900',
        badgeBorder: 'border-blue-300',
        iconColor: 'text-blue-700',
        dividerColor: 'border-blue-200/70',
        hoverBg: 'hover:bg-blue-100/50',
        previewColor: '#1d4ed8',
        logoFilter: 'none',
        scrollbarThumb: '#2563eb',
        scrollbarTrack: '#dbeafe',
        scrollbarThumbHover: '#1d4ed8',
    },
    emerald: {
        id: 'emerald',
        name: 'Eco Emerald (Vibrant Forest)',
        bgMain: 'bg-[#e4f5ed] text-slate-900',
        textMain: 'text-slate-950',
        textMuted: 'text-slate-700',
        cardBg: 'bg-white text-slate-900 shadow-sm',
        accentSurface: 'bg-emerald-50/70',
        cardBorder: 'border-emerald-300/80',
        cardHoverBorder: 'hover:border-emerald-500',
        cardGlow: 'hover:shadow-emerald-500/20 hover:shadow-md',
        primaryBg: 'bg-emerald-700 text-white',
        primaryHover: 'hover:bg-emerald-800',
        primaryText: 'text-emerald-800',
        primaryBorder: 'border-emerald-300',
        inputBg: 'bg-emerald-50/50 focus:bg-white',
        inputBorder: 'border-emerald-300',
        inputText: 'text-slate-950',
        focusRing: 'focus:ring-emerald-600 focus-visible:ring-emerald-600',
        softRing: 'ring-emerald-100',
        timelineLineBg: 'before:bg-emerald-200',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-950',
        badgeBorder: 'border-emerald-300',
        iconColor: 'text-emerald-700',
        dividerColor: 'border-emerald-200/70',
        hoverBg: 'hover:bg-emerald-100/50',
        previewColor: '#047857',
        logoFilter: 'hue-rotate(-90deg) saturate(0.95)',
        scrollbarThumb: '#059669',
        scrollbarTrack: '#d1fae5',
        scrollbarThumbHover: '#047857',
    },
    obsidian: {
        id: 'obsidian',
        name: 'Soft Slate (Calm Cyan)',
        bgMain: 'bg-slate-100 text-slate-900',
        textMain: 'text-slate-800',
        textMuted: 'text-slate-600',
        cardBg: 'bg-white text-slate-800 shadow-sm',
        accentSurface: 'bg-cyan-50/70',
        cardBorder: 'border-slate-300',
        cardHoverBorder: 'hover:border-cyan-400',
        cardGlow: 'hover:shadow-cyan-700/10 hover:shadow-md',
        primaryBg: 'bg-cyan-700 text-white',
        primaryHover: 'hover:bg-cyan-800',
        primaryText: 'text-cyan-800',
        primaryBorder: 'border-cyan-300',
        inputBg: 'bg-slate-50 focus:bg-white',
        inputBorder: 'border-slate-300',
        inputText: 'text-slate-900',
        focusRing: 'focus:ring-cyan-600 focus-visible:ring-cyan-600',
        softRing: 'ring-cyan-100',
        timelineLineBg: 'before:bg-slate-300',
        badgeBg: 'bg-cyan-100',
        badgeText: 'text-cyan-950',
        badgeBorder: 'border-cyan-300',
        iconColor: 'text-cyan-700',
        dividerColor: 'border-slate-200',
        hoverBg: 'hover:bg-cyan-50',
        previewColor: '#0e7490',
        logoFilter: 'hue-rotate(-35deg) saturate(0.9)',
        scrollbarThumb: '#0891b2',
        scrollbarTrack: '#cffafe',
        scrollbarThumbHover: '#0e7490',
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Amber (Warm Terracotta)',
        bgMain: 'bg-[#faede3] text-slate-900',
        textMain: 'text-slate-950',
        textMuted: 'text-slate-700',
        cardBg: 'bg-white text-slate-900 shadow-sm',
        accentSurface: 'bg-amber-50/70',
        cardBorder: 'border-amber-300/80',
        cardHoverBorder: 'hover:border-amber-500',
        cardGlow: 'hover:shadow-amber-500/20 hover:shadow-md',
        primaryBg: 'bg-amber-700 text-white',
        primaryHover: 'hover:bg-amber-800',
        primaryText: 'text-amber-800',
        primaryBorder: 'border-amber-300',
        inputBg: 'bg-amber-50/60 focus:bg-white',
        inputBorder: 'border-amber-300',
        inputText: 'text-slate-950',
        focusRing: 'focus:ring-amber-600 focus-visible:ring-amber-600',
        softRing: 'ring-amber-100',
        timelineLineBg: 'before:bg-amber-200',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-950',
        badgeBorder: 'border-amber-300',
        iconColor: 'text-amber-700',
        dividerColor: 'border-amber-200/70',
        hoverBg: 'hover:bg-amber-100/50',
        previewColor: '#b45309',
        logoFilter: 'hue-rotate(175deg) saturate(0.9)',
        scrollbarThumb: '#d97706',
        scrollbarTrack: '#fef3c7',
        scrollbarThumbHover: '#b45309',
    },
    amethyst: {
        id: 'amethyst',
        name: 'Royal Amethyst (Deep Orchid)',
        bgMain: 'bg-[#f0e8f7] text-slate-900',
        textMain: 'text-slate-950',
        textMuted: 'text-slate-700',
        cardBg: 'bg-white text-slate-900 shadow-sm',
        accentSurface: 'bg-purple-50/70',
        cardBorder: 'border-purple-300/80',
        cardHoverBorder: 'hover:border-purple-500',
        cardGlow: 'hover:shadow-purple-500/20 hover:shadow-md',
        primaryBg: 'bg-purple-700 text-white',
        primaryHover: 'hover:bg-purple-800',
        primaryText: 'text-purple-800',
        primaryBorder: 'border-purple-300',
        inputBg: 'bg-purple-50/60 focus:bg-white',
        inputBorder: 'border-purple-300',
        inputText: 'text-slate-950',
        focusRing: 'focus:ring-purple-600 focus-visible:ring-purple-600',
        softRing: 'ring-purple-100',
        timelineLineBg: 'before:bg-purple-200',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-950',
        badgeBorder: 'border-purple-300',
        iconColor: 'text-purple-700',
        dividerColor: 'border-purple-200/70',
        hoverBg: 'hover:bg-purple-100/50',
        previewColor: '#6d28d9',
        logoFilter: 'hue-rotate(45deg) saturate(0.95)',
        scrollbarThumb: '#9333ea',
        scrollbarTrack: '#f3e8ff',
        scrollbarThumbHover: '#7e22ce',
    },
    crimson: {
        id: 'crimson',
        name: 'Ruby Crimson (Rich Coral & Rose)',
        bgMain: 'bg-[#fceaea] text-slate-900',
        textMain: 'text-slate-950',
        textMuted: 'text-slate-700',
        cardBg: 'bg-white text-slate-900 shadow-sm',
        accentSurface: 'bg-rose-50/70',
        cardBorder: 'border-rose-300/80',
        cardHoverBorder: 'hover:border-rose-500',
        cardGlow: 'hover:shadow-rose-500/20 hover:shadow-md',
        primaryBg: 'bg-rose-700 text-white',
        primaryHover: 'hover:bg-rose-800',
        primaryText: 'text-rose-800',
        primaryBorder: 'border-rose-300',
        inputBg: 'bg-rose-50/60 focus:bg-white',
        inputBorder: 'border-rose-300',
        inputText: 'text-slate-950',
        focusRing: 'focus:ring-rose-600 focus-visible:ring-rose-600',
        softRing: 'ring-rose-100',
        timelineLineBg: 'before:bg-rose-200',
        badgeBg: 'bg-rose-100',
        badgeText: 'text-rose-950',
        badgeBorder: 'border-rose-300',
        iconColor: 'text-rose-700',
        dividerColor: 'border-rose-200/70',
        hoverBg: 'hover:bg-rose-100/50',
        previewColor: '#be123c',
        logoFilter: 'hue-rotate(140deg) saturate(0.9)',
        scrollbarThumb: '#e11d48',
        scrollbarTrack: '#ffe4e6',
        scrollbarThumbHover: '#be123c',
    },
};

const STORAGE_KEY = 'mission-lokal-resident-theme';

export function getResidentTheme(): ResidentTheme {
    if (typeof window === 'undefined') return RESIDENT_THEMES.sapphire;
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY) as ResidentThemeId;
        if (saved && saved in RESIDENT_THEMES) {
            return RESIDENT_THEMES[saved];
        }
    } catch {}
    return RESIDENT_THEMES.sapphire;
}

export function setResidentTheme(id: ResidentThemeId) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    window.dispatchEvent(new Event('resident-theme-change'));
}