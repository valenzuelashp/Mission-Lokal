import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

export default function FeedComposer() {
    const theme = useResidentTheme();
    const { user } = useAuth();
    const initials = user?.first_name?.[0] ?? user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <Card className={`overflow-hidden ${theme.cardBorder} ${theme.cardBg} shadow-sm rounded-3xl w-full`}>
            <CardContent className="p-4 sm:p-5">
                <Button asChild className={`h-13 w-full gap-3 px-4 text-xs font-black sm:text-sm ${theme.primaryBg} ${theme.primaryHover} text-white shadow-md cursor-pointer rounded-2xl`}>
                    <Link href="/concerns/new">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-black">
                            {initials}
                        </span>
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Post a Community Concern</span>
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}