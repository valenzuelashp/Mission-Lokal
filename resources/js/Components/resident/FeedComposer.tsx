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
        <Card className={`overflow-hidden ${theme.cardBorder} ${theme.cardBg} shadow-xs rounded-2xl`}>
            <CardContent className="p-3.5">
                <Button asChild className={`h-12 w-full gap-2.5 text-xs font-bold uppercase tracking-wider ${theme.primaryBg} ${theme.primaryHover} shadow-sm cursor-pointer`}>
                    <Link href="/concerns/new">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-black">
                            {initials}
                        </span>
                        <Plus className="h-4 w-4" />
                        Post a Community Concern
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}