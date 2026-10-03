import * as React from 'react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <label
                ref={ref}
                className={cn('text-xs font-black uppercase tracking-wider leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', theme.textMain, className)}
                {...props}
            />
        );
    },
);
Label.displayName = 'Label';

export { Label };