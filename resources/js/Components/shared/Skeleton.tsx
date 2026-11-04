import { cn } from '@/Lib/utils';

export function Skeleton({ className = '' }: { className?: string }) {
    return <div aria-hidden="true" className={cn('ui-skeleton animate-pulse rounded-lg', className)} />;
}

export function CardSkeleton() {
    return (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
        </div>
    );
}