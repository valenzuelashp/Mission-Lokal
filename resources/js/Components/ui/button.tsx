import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/Lib/utils';
import { useResidentTheme } from '@/Layouts/ResidentLayout';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer shadow-2xs active:scale-95',
    {
        variants: {
            variant: {
                default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
                secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
                outline: 'border border-inherit/80 bg-card hover:bg-slate-100/50 transition-colors',
                ghost: 'hover:bg-slate-100/50 transition-colors',
                destructive: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
            },
            size: {
                default: 'h-11 px-5 py-2.5',
                sm: 'h-9 rounded-xl px-3.5',
                lg: 'h-12 rounded-2xl px-8 text-sm',
                icon: 'h-10 w-10 rounded-2xl',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const theme = useResidentTheme();
        const Comp = asChild ? Slot : 'button';
        const paletteClasses = {
            default: `${theme.primaryBg} ${theme.primaryHover}`,
            secondary: `${theme.badgeBg} ${theme.textMain} ${theme.badgeBorder}`,
            outline: `${theme.cardBorder} ${theme.cardBg} ${theme.textMain} ${theme.hoverBg}`,
            ghost: `${theme.textMuted} ${theme.hoverBg}`,
        }[variant ?? 'default'];
        return <Comp className={cn(buttonVariants({ variant, size }), paletteClasses, className)} ref={ref} {...props} />;
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };