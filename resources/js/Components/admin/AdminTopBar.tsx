import { Bell, Menu, Search, Settings, User } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';

type Props = {
    title: string;
    onMenuClick?: () => void;
};

export default function AdminTopBar({ title, onMenuClick }: Props) {
    return (
        <header className="flex items-center justify-between gap-4 border-b bg-card px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-semibold text-blue-800">{title}</h1>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 sm:max-w-md">
                <div className="relative hidden w-full sm:block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search mission ID…" />
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                    <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0 rounded-full bg-blue-100 text-blue-700">
                    <User className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
