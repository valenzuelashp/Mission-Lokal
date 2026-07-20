import { Link } from '@inertiajs/react';
import { BookOpen, FileText, Home, Megaphone, User, Award, Shield, Target } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import { useActivePath } from '@/Hooks/useActivePath';
import { demoResidentProfile } from '@/Lib/residentDemo';
import { cn } from '@/Lib/utils';

const shortcuts = [
    { href: '/feed', label: 'Public Feed', icon: Home },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/blotter/new', label: 'File Blotter', icon: FileText },
    { href: '/library', label: 'Library Center', icon: BookOpen },
    { href: '/profile', label: 'My Profile', icon: User },
];

export default function ResidentShortcuts() {
    const { user } = useAuth();
    const { isActive } = useActivePath();
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    // Math algorithms for level tracking matching design goals
    const currentXp = user?.civic_xp ?? 25;
    const nextLevelXp = 50;
    const xpPercentage = Math.min((currentXp / nextLevelXp) * 100, 100);

    return (
        <div className="space-y-4">
            {/* Gamified Civic Level Tracker Progress Anchor */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden p-4 space-y-3">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-sm border border-neutral-800">
                        {initials}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-neutral-900 text-xs uppercase tracking-tight">
                            {demoResidentProfile.full_name}
                        </p>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Level 2 Civic Advocate</p>
                    </div>
                </div>

            </Card>

            {/* Navigation Routes Shortcut Card Layout */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl">
                <CardContent className="p-2">
                    <p className="px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-neutral-400">
                        Control Hub
                    </p>
                    <nav className="space-y-0.5">
                        {shortcuts.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all border border-transparent',
                                        active 
                                            ? 'bg-neutral-100 text-neutral-900 border-neutral-200/40 shadow-inner' 
                                            : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                                    )}
                                >
                                    <item.icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-neutral-900" : "text-neutral-400")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </CardContent>
            </Card>

            {/* Gamified Achievements Badge Drawer Panel Box */}
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-sm rounded-2xl p-3 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400 px-1">Unlocked Achievements</p>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                    <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center justify-center text-neutral-800 title='First Report Badge'" title="First Report Logged">
                        <Award className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center justify-center text-neutral-800" title="Community Helper">
                        <Shield className="h-4 w-4" />
                    </div>
                    <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center justify-center text-neutral-300 border-dashed border-neutral-200" title="Locked: Flood Watcher">
                        <Target className="h-4 w-4 opacity-40" />
                    </div>
                    <div className="p-2 bg-neutral-50 border border-neutral-200/50 rounded-xl flex items-center justify-center text-neutral-300 border-dashed border-neutral-200" title="Locked: 100 XP Elite Club">
                        <Award className="h-4 w-4 opacity-40" />
                    </div>
                </div>
            </Card>

            <div className="px-1">
                <ResidentLogoutButton />
            </div>
        </div>
    );
}