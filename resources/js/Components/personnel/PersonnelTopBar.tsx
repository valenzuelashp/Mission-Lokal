import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type Props = {
    title: string;
    onMenuClick?: () => void;
};

export default function PersonnelTopBar({ title, onMenuClick }: Props) {
    const shortTitle = title.includes(':') ? title.split(':').pop()?.trim() ?? title : title;

    return (
        <header className="flex items-center gap-2 border-b bg-card px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3 lg:px-6">
            <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={onMenuClick}>
                <Menu className="h-5 w-5" />
            </Button>
            <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-blue-800 sm:text-lg">
                <span className="sm:hidden">{shortTitle}</span>
                <span className="hidden sm:inline">{title}</span>
            </h1>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <div className="relative hidden w-full max-w-xs md:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search mission ID…" readOnly />
                </div>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-blue-100 text-blue-700">
                    <User className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
