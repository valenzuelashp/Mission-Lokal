import * as React from 'react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-2xs file:border-0 file:bg-transparent file:text-xs file:font-bold placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                    theme.inputBg,
                    theme.inputBorder,
                    theme.inputText,
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = 'Input';

export { Input };