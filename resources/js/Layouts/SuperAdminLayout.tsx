import { router, usePage, Link } from '@inertiajs/react';
import { Building2, LayoutDashboard, LogOut, ShieldCheck, Globe, UserCircle, KeyRound, MessageSquareWarning } from 'lucide-react';
import ProfilePhotoPicker from '@/Components/shared/ProfilePhotoPicker';
import { PropsWithChildren } from 'react';

export default function SuperAdminLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-300">
            <aside className="w-64 bg-slate-950 flex flex-col border-r border-slate-800/80">
                <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-black text-white tracking-wider text-sm">MISSION-LOKAL</h1>
                        <span className="text-[10px] text-blue-400 font-extrabold uppercase tracking-widest">Global SuperAdmin</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Platform Control</div>
                    <Link
                        href="/super-admin/dashboard"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4 text-slate-400" />
                        Overview Dashboard
                    </Link>
                    <Link
                        href="/super-admin/barangays"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                        <Building2 className="h-4 w-4 text-slate-400" />
                        Barangay Tenants
                    </Link>
                    <Link
                        href="/super-admin/barangay-appeals"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                        <MessageSquareWarning className="h-4 w-4 text-slate-400" />
                        Node Appeals
                    </Link>
                    <Link
                        href="/super-admin/profile-edits"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                        <UserCircle className="h-4 w-4 text-slate-400" />
                        Profile Requests
                    </Link>
                    <Link
                        href="/super-admin/clearances"
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-colors"
                    >
                        <KeyRound className="h-4 w-4 text-slate-400" />
                        Security Clearances
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                    <div className="mb-3 space-y-2 px-2">
                        <div className="overflow-hidden">
                            <p className="truncate text-xs font-bold text-white">{user?.first_name} {user?.last_name}</p>
                            <p className="truncate text-[10px] text-slate-400">{user?.email}</p>
                        </div>
                        <ProfilePhotoPicker
                            fallback="S"
                            avatarClassName="h-9 w-9 rounded-xl border border-blue-500/30 bg-blue-600/20 text-xs font-bold text-blue-400"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => router.post('/logout')}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] text-slate-900">
                <header className="h-16 bg-white/80 border-b border-slate-200/80 px-8 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
                    <h2 className="text-base font-extrabold text-slate-900">{title || 'Global Management Portal'}</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Globe className="h-3.5 w-3.5 text-blue-600 animate-spin-slow" /> Master Infrastructure Node
                    </span>
                </header>
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}