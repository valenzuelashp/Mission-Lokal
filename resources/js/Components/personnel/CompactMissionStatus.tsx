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
        <ol className="flex flex-wrap gap-2 sm:flex-col sm:gap-3">
            {steps.map((step) => (
                <li
                    key={step.key}
                    className={cn(
                        'flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-xs transition-all duration-200 sm:rounded-none sm:border-0 sm:px-0 sm:py-0',
                        step.state === 'current' && 'border-neutral-900 bg-neutral-900 text-white sm:bg-transparent sm:text-neutral-900',
                        step.state === 'upcoming' && 'text-neutral-400 border-neutral-200/60 bg-neutral-50/50',
                        step.state === 'done' && 'border-neutral-200 bg-white text-neutral-800'
                    )}
                >
                    {step.state === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-neutral-900" />
                    ) : (
                        <Circle
                            className={cn(
                                'h-4 w-4 shrink-0 transition-transform duration-300',
                                step.state === 'current' ? 'text-neutral-900 scale-110 sm:text-neutral-900' : 'text-neutral-300',
                            )}
                        />
                    )}
                    <span className={cn(
                        'font-bold tracking-tight',
                        step.state === 'current' && 'font-black sm:text-neutral-900'
                    )}>
                        {step.label}
                    </span>
                    {step.at && (
                        <span className="hidden text-[10px] font-medium text-neutral-400 sm:ml-auto sm:inline tabular-nums">
                            {step.at}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}