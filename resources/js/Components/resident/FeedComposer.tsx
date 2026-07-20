import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { useAuth } from '@/Hooks/usePageProps';

export default function FeedComposer() {
    const { user } = useAuth();
    const initials = user?.account_id?.slice(0, 2) ?? 'R';

    return (
        <Card className="overflow-hidden border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm rounded-xl">
            <CardContent className="p-3">
                <Button asChild className="h-11 w-full gap-2 text-sm font-bold bg-slate-900 text-slate-50 hover:bg-slate-800 shadow-md transition-transform duration-200 active:scale-[0.99]">
                    <Link href="/concerns/new">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-black tracking-wider border border-white/20">
                            {initials}
                        </span>
                        <Plus className="h-4 w-4 text-blue-400" />
                        Post a concern
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}