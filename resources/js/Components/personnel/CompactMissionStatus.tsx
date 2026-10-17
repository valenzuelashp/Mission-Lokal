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
        <ol className="flex flex-wrap gap-2.5 sm:flex-col sm:gap-2.5">
            {steps.map((step) => (
                <li
                    key={step.key}
                    className={cn(
                        'flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all shadow-2xs',
                        step.state === 'done' && 'border-emerald-200 bg-emerald-50/80 text-emerald-950 font-black',
                        step.state === 'current' && 'border-blue-300 bg-blue-50 text-blue-950 font-black ring-2 ring-blue-600/20',
                        step.state === 'upcoming' && 'border-slate-200 bg-white text-slate-400 font-semibold',
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
                        <span className="ml-auto hidden text-[10px] font-mono font-bold text-slate-500 sm:inline bg-white/60 px-2 py-0.5 rounded-lg border border-slate-200/50">
                            {step.at}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}