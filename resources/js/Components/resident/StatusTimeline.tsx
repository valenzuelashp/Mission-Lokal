import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/Lib/utils';

export type TimelineStep = {
    key: string;
    label: string;
    state: 'done' | 'current' | 'upcoming';
    at?: string;            // Added optional property
    description?: string;   // Added optional property
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
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                            <Circle className={cn('h-5 w-5', step.state === 'current' ? 'text-primary' : 'text-slate-300')} />
                        )}
                        {i < steps.length - 1 && <div className="my-1 w-px flex-1 bg-slate-200 min-h-[1.5rem]" />}
                    </div>
                    <div className="pb-4">
                        <p className={cn('text-sm font-medium', step.state === 'upcoming' ? 'text-slate-400' : 'text-slate-900')}>
                            {step.label}
                        </p>
                        {step.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                        )}
                        {step.at && (
                            <p className="text-xs text-muted-foreground mt-0.5">{step.at}</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}