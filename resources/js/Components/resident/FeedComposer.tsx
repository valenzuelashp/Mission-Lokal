import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';

export default function FeedComposer() {
    const { user } = useAuth();
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <Card className="overflow-hidden shadow-sm">
            <CardContent className="p-3">
                <Button asChild className="h-11 w-full gap-2 text-sm font-semibold">
                    <Link href="/concerns/new">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                            {initials}
                        </span>
                        <Plus className="h-4 w-4" />
                        Post a concern
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
