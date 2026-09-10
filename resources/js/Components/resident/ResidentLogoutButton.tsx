import { router } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/Components/ui/button';
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
    // The actual logout action that tells Laravel to end the session
    const logout = () => {
        router.post('/logout');
    };

    // 1. Determine which button style to show based on the variant prop
    let triggerButton;

    if (variant === 'icon') {
        triggerButton = (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn('rounded-full text-muted-foreground', className)}
                aria-label="Logout"
            >
                <LogOut className="h-5 w-5" />
            </Button>
        );
    } else if (variant === 'outline') {
        triggerButton = (
            <Button type="button" variant="outline" className={cn('justify-start', className)}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        );
    } else {
        triggerButton = (
            <button
                type="button"
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

    // 2. Wrap the chosen button inside the AlertDialog
    return (
        <AlertDialog>
            {/* asChild tells the Trigger to use our custom button instead of rendering its own default button */}
            <AlertDialogTrigger asChild>
                {triggerButton}
            </AlertDialogTrigger>
            
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        You will need to sign back in to access the barangay feed and your records.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    {/* The logout function is only fired if they click this action button */}
                    <AlertDialogAction onClick={logout} className="bg-red-600 hover:bg-red-700 text-white">
                        Log out
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}