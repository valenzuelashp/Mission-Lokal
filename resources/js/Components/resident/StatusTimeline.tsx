import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/Lib/utils';

export type TimelineStep = {
    key: string;
    label: string;
    description?: string;
    at?: string;
    state: 'done' | 'current' | 'upcoming';
};

type Props = {
    steps: TimelineStep[];
};

export default function StatusTimeline({ steps }: Props) {
    return (
        <ol className="space-y-0">
            {steps.map((step, i) => (
                <li key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                        {step.state === 'done' ? (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 drop-shadow-[0_0_2px_rgba(37,99,235,0.2)]" />
                        ) : (
                            <Circle
                                className={cn(
                                    'h-5 w-5 fill-white transition-all',
                                    step.state === 'current' 
                                        ? 'text-blue-600 stroke-[2.5] drop-shadow-[0_0_3px_rgba(37,99,235,0.3)]' 
                                        : 'text-slate-300'
                                )}
                            />
                        )}
                        {i < steps.length - 1 && (
                            <div 
                                className={cn(
                                    "my-1 w-0.5 flex-1 min-h-[2.5rem] rounded-full",
                                    step.state === 'done' ? "bg-blue-600" : "bg-slate-200"
                                )} 
                            />
                        )}
                    </div>
                    <div className="pb-6">
                        <p
                            className={cn(
                                'font-bold tracking-tight text-sm',
                                step.state === 'upcoming' && 'text-slate-400',
                                step.state === 'current' && 'text-blue-600',
                                step.state === 'done' && 'text-slate-800'
                            )}
                        >
                            {step.label}
                        </p>
                        {step.description && (
                            <p className={cn("mt-0.5 text-xs font-medium", step.state === 'upcoming' ? "text-slate-400" : "text-slate-600")}>
                                {step.description}
                            </p>
                        )}
                        {step.at && <p className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{step.at}</p>}
                    </div>
                </li>
            ))}
        </ol>
    );
}