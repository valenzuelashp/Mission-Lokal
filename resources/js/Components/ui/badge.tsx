import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/Lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors shadow-2xs',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-blue-600 text-white',
                secondary: 'border-transparent bg-slate-100 text-slate-900',
                outline: 'border-inherit bg-card',
                success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
                warning: 'border-amber-200 bg-amber-50 text-amber-800',
                danger: 'border-rose-200 bg-rose-50 text-rose-800',
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