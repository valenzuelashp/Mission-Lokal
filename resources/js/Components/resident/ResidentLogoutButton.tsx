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
                className={cn(`rounded-2xl h-11 w-11 ${theme.textMuted} hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors`, className)}
                aria-label="Logout"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        );
    } else if (variant === 'outline') {
        triggerButton = (
            <Button type="button" variant="outline" className={cn(`font-bold cursor-pointer rounded-2xl h-11 px-5 ${theme.cardBorder}`, className)}>
                <LogOut className="mr-2 h-4 w-4 text-rose-600" />
                Logout Session
            </Button>
        );
    } else {
        triggerButton = (
            <button
                type="button"
                className={cn(
                    `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black ${theme.textMuted} transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer`,
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
            
            <AlertDialogContent className={`rounded-3xl border ${theme.cardBorder} ${theme.cardBg} p-8`}>
                <AlertDialogHeader className="space-y-3">
                    <AlertDialogTitle className={`text-xl font-black tracking-tight ${theme.textMain}`}>Logout Session?</AlertDialogTitle>
                    <AlertDialogDescription className={`text-xs ${theme.textMuted} font-medium leading-relaxed`}>
                        You will need to re-authenticate with your municipal account ID to access the resident portal.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4">
                    <AlertDialogCancel className="rounded-2xl font-bold cursor-pointer h-11 px-6">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={logout} className="rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black cursor-pointer h-11 px-6">
                        Confirm Logout
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}