import { router, usePage } from '@inertiajs/react'; // <-- Ensure router is imported
import { Building2, LayoutDashboard, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { PropsWithChildren } from 'react';

export default function SuperAdminLayout({ children, title }: PropsWithChildren<{ title?: string }>) {
    const { auth } = usePage().props as any;
    const user = auth.user;


    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Super Admin Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white tracking-wide">Mission-Lokal</h1>
                        <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">Super Administrator</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Platform Management</div>
                    <a
                        href="/super-admin/dashboard"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Overview Dashboard
                    </a>
                    <a
                        href="/super-admin/barangays"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <Building2 className="h-4 w-4" />
                        Barangay Nodes
                    </a>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-3 px-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                            {user?.first_name?.[0] || 'S'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                type="button"
                onClick={() => router.post('/logout')}
                className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white cursor-pointer"
            >
                <LogOut className="h-4 w-4" />
                Logout
            </button>
                </div>
            </aside>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800">{title || 'Super Admin Portal'}</h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <UserCheck className="h-3.5 w-3.5" /> Global Master Operator
                    </span>
                </header>
                <main className="p-8 flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}