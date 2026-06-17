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
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                            <Circle
                                className={cn(
                                    'h-5 w-5',
                                    step.state === 'current' ? 'text-primary' : 'text-muted-foreground/40',
                                )}
                            />
                        )}
                        {i < steps.length - 1 && <div className="my-1 w-px flex-1 bg-border min-h-[2rem]" />}
                    </div>
                    <div className="pb-6">
                        <p
                            className={cn(
                                'font-medium',
                                step.state === 'upcoming' && 'text-muted-foreground',
                            )}
                        >
                            {step.label}
                        </p>
                        {step.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                        )}
                        {step.at && <p className="mt-1 text-xs text-muted-foreground">{step.at}</p>}
                    </div>
                </li>
            ))}
        </ol>
    );
}
