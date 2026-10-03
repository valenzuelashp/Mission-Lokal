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
        <ol className="flex flex-wrap gap-2.5 sm:flex-col sm:gap-2">
            {steps.map((step) => (
                <li
                    key={step.key}
                    className={cn(
                        'flex items-center gap-2.5 rounded-full border px-3 py-1.5 text-xs font-semibold sm:rounded-xl sm:border sm:px-3.5 sm:py-2.5 transition-all shadow-2xs',
                        step.state === 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                        step.state === 'current' && 'border-blue-300 bg-blue-50 text-blue-950 font-bold ring-2 ring-blue-600/20',
                        step.state === 'upcoming' && 'border-slate-200 bg-white text-slate-400',
                    )}
                >
                    {step.state === 'done' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                        <Circle
                            className={cn(
                                'h-4 w-4 shrink-0',
                                step.state === 'current' ? 'text-blue-600 fill-blue-600/20' : 'text-slate-300',
                            )}
                        />
                    )}
                    <span className="truncate">{step.label}</span>
                    {step.at && (
                        <span className="ml-auto hidden text-[10px] font-mono font-medium text-slate-500 sm:inline">
                            {step.at}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}