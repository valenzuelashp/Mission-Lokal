import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/Lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-xl border px-3 py-1 text-xs font-black transition-colors shadow-2xs',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-blue-600 text-white',
                secondary: 'border-transparent bg-slate-100 text-slate-900',
                outline: 'border-inherit bg-card',
                success: 'border-emerald-200 bg-emerald-50 text-emerald-800 font-black',
                warning: 'border-amber-200 bg-amber-50 text-amber-900 font-black',
                danger: 'border-rose-200 bg-rose-50 text-rose-800 font-black',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };