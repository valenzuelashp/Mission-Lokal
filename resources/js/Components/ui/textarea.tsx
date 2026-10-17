import * as React from 'react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
    ({ className, ...props }, ref) => {
        const theme = useResidentTheme();
        return (
            <textarea
                className={cn(
                    'flex min-h-[120px] w-full rounded-2xl border px-4 py-3 text-xs font-bold shadow-2xs placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-colors',
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
Textarea.displayName = 'Textarea';

export { Textarea };