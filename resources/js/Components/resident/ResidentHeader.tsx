import { Link } from '@inertiajs/react';
import { Search } from 'lucide-react';
import ResidentLogoutButton from '@/Components/resident/ResidentLogoutButton';
import { Input } from '@/Components/ui/input';
import { useAuth } from '@/Hooks/usePageProps';

export default function ResidentHeader() {
    const { user } = useAuth();
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-md shadow-sm">
            <div className="flex h-14 w-full items-center gap-3 px-4 xl:px-8">
                <Link href="/feed" className="flex shrink-0 items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-slate-100 border border-slate-800 shadow-md group-hover:scale-105 transition-transform">
                        ML
                    </div>
                    <span className="hidden font-black text-slate-900 tracking-tight sm:inline">
                        Mission-<span className="text-blue-600">Lokal</span>
                    </span>
                </Link>

                <div className="relative hidden max-w-xs flex-1 md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        className="h-9 rounded-xl bg-slate-100 border-slate-200 pl-9 text-slate-800 placeholder:text-slate-400 focus-visible:ring-blue-500"
                        placeholder="Search concerns…"
                        readOnly
                    />
                </div>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    {user && (
                        <Link
                            href="/profile"
                            className="flex items-center gap-2 rounded-xl bg-slate-100/80 border border-slate-200/60 py-1 pl-1 pr-3 hover:bg-slate-100 transition-colors"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-slate-100">
                                {initials}
                            </span>
                            <span className="hidden text-xs font-bold text-slate-700 sm:inline">
                                {user.civic_xp} <span className="text-blue-600 font-black">XP</span>
                            </span>
                        </Link>
                    )}
                    <ResidentLogoutButton variant="icon" />
                </div>
            </div>
        </header>
    );
}