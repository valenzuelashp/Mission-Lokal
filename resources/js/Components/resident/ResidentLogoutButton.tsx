import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/Lib/utils';

type Props = {
    variant?: 'icon' | 'menu' | 'outline';
    className?: string;
};

export default function ResidentLogoutButton({ variant = 'menu', className }: Props) {
    const logout = () => router.post('/logout');

    if (variant === 'icon') {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('rounded-full text-muted-foreground', className)}
                onClick={logout}
                aria-label="Logout"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        );
    }

    if (variant === 'outline') {
        return (
            <Button type="button" variant="outline" className={cn('justify-start', className)} onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        );
    }

    return (
        <button
            type="button"
            onClick={logout}
            className={cn(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#f0f2f5]',
                className,
            )}
        >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
        </button>
    );
}
