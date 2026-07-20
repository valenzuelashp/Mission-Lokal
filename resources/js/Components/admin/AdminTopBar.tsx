import { router } from '@inertiajs/react';
import { Bell, Menu, Search, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type Props = {
    title: string;
    onMenuClick?: () => void;
};

export default function AdminTopBar({ title, onMenuClick }: Props) {
    const shortTitle = title.includes(':') ? title.split(':').pop()?.trim() ?? title : title;

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md px-4 py-3 sm:gap-4 sm:px-6 shadow-sm">
            <Button variant="ghost" size="icon" className="shrink-0 rounded-xl lg:hidden text-neutral-800 hover:bg-neutral-100" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>
            
            <h1 className="min-w-0 flex-1 truncate text-xs font-black uppercase tracking-widest text-neutral-800 sm:text-sm">
                <span className="sm:hidden">{shortTitle}</span>
                <span className="hidden sm:inline">{title}</span>
            </h1>
            
            <div className="flex shrink-0 items-center gap-2">
                <div className="relative hidden w-48 max-w-xs md:block">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                    <Input className="pl-8.5 h-8.5 rounded-xl border-neutral-200 bg-white/50 text-xs font-bold placeholder-neutral-400 focus:bg-white" placeholder="Search operational indices..." readOnly />
                </div>
                
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl text-neutral-700 hover:bg-neutral-100">
                    <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl text-neutral-700 hover:bg-neutral-100">
                    <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4 stroke-[2.5]" />
                </Button>
                
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 p-0 text-neutral-800 shadow-sm">
                    <User className="h-4 w-4 stroke-[2.5]" />
                </div>
            </div>
        </header>
    );
}