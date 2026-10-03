import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/Components/ui/alert-dialog';

type Props = {
    variant?: 'icon' | 'menu' | 'outline';
    className?: string;
};

export default function ResidentLogoutButton({ variant = 'menu', className }: Props) {
    const theme = useResidentTheme();

    const logout = () => {
        router.post('/logout');
    };

    let triggerButton;

    if (variant === 'icon') {
        triggerButton = (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(`rounded-xl ${theme.textMuted} hover:text-red-600 hover:bg-red-50 cursor-pointer`, className)}
                aria-label="Logout"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        );
    } else if (variant === 'outline') {
        triggerButton = (
            <Button type="button" variant="outline" className={cn('justify-start font-bold cursor-pointer', className)}>
                <LogOut className="mr-2 h-4 w-4 text-rose-600" />
                Logout Session
            </Button>
        );
    } else {
        triggerButton = (
            <button
                type="button"
                className={cn(
                    `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold ${theme.textMuted} transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer`,
                    className,
                )}
            >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout Session
            </button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {triggerButton}
            </AlertDialogTrigger>
            
            <AlertDialogContent className={`rounded-2xl border ${theme.cardBorder} ${theme.cardBg}`}>
                <AlertDialogHeader>
                    <AlertDialogTitle className={`font-extrabold ${theme.textMain}`}>Logout?</AlertDialogTitle>
                    <AlertDialogDescription className={`text-xs ${theme.textMuted}`}>
                        You will need to re-authenticate with your municipal account ID to access the resident portal.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl font-semibold cursor-pointer">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer">
                        Confirm Logout
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}