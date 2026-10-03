import * as React from 'react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <div
                ref={ref}
                className={cn('rounded-2xl border shadow-xs transition-colors', theme.cardBg, theme.cardBorder, theme.textMain, className)}
                {...props}
            />
        );
    },
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <div
                ref={ref}
                className={cn('flex flex-col space-y-1.5 p-6', theme.dividerColor && `border-b ${theme.dividerColor}`, className)}
                {...props}
            />
        );
    },
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <h3
                ref={ref}
                className={cn('text-base font-black leading-none tracking-tight', theme.textMain, className)}
                {...props}
            />
        );
    },
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <p ref={ref} className={cn('text-xs font-medium', theme.textMuted, className)} {...props} />
        );
    },
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />,
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <div
                ref={ref}
                className={cn('flex items-center p-6 pt-0 border-t', theme.dividerColor, className)}
                {...props}
            />
        );
    },
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };