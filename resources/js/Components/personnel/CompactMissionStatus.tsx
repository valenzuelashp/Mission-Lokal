import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/Lib/utils';

export type CompactStep = {
    key: string;
    label: string;
    at?: string;
    state: 'done' | 'current' | 'upcoming';
};

type Props = {
    steps: CompactStep[];
};

export default function CompactMissionStatus({ steps }: Props) {
    return (
        <ol className="flex flex-wrap gap-2 sm:flex-col sm:gap-1.5">
            {steps.map((step) => (
                <li
                    key={step.key}
                    className={cn(
                        'flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs sm:rounded-none sm:border-0 sm:px-0 sm:py-0',
                        step.state === 'current' && 'border-blue-200 bg-blue-50 sm:bg-transparent',
                        step.state === 'upcoming' && 'text-muted-foreground',
                    )}
                >
                    {step.state === 'done' ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                    ) : (
                        <Circle
                            className={cn(
                                'h-3.5 w-3.5 shrink-0',
                                step.state === 'current' ? 'text-primary' : 'text-muted-foreground/40',
                            )}
                        />
                    )}
                    <span className={cn(step.state === 'current' && 'font-semibold text-blue-900')}>
                        {step.label}
                    </span>
                    {step.at && (
                        <span className="hidden text-[10px] text-muted-foreground sm:ml-auto sm:inline">
                            {step.at}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}
