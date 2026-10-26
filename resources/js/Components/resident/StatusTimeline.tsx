import { CheckCircle2, Circle } from 'lucide-react';
import { useResidentTheme } from '@/Layouts/ResidentLayout';
import { cn } from '@/Lib/utils';

export type TimelineStep = {
    key: string;
    label: string;
    state: 'done' | 'current' | 'upcoming';
    at?: string;
    description?: string;
};

type Props = {
    steps: TimelineStep[];
};

export default function StatusTimeline({ steps }: Props) {
    const theme = useResidentTheme();

    if (steps.length === 0) {
        return (
            <p className={`text-xs ${theme.textMuted} leading-relaxed font-medium`}>
                Your submission is recorded. The barangay's decision will appear here once it approves the report and assigns a mission, or rejects it with a reason.
            </p>
        );
    }

    return (
        <ol className={`space-y-0 relative before:absolute before:bottom-4 before:top-4 before:left-3 before:w-0.5 before:content-[''] ${theme.timelineLineBg}`}>
            {steps.map((step) => (
                <li key={step.key} className="flex gap-4 relative pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                        {step.state === 'done' ? (
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs z-10">
                                <CheckCircle2 className="h-4 w-4" />
                            </span>
                        ) : step.state === 'current' ? (
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${theme.primaryBg} text-white shadow-md ring-4 ${theme.softRing} z-10 animate-pulse`}>
                                <Circle className="h-3 w-3 fill-current" />
                            </span>
                        ) : (
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${theme.cardBg} ${theme.textMuted} border ${theme.cardBorder} z-10`}>
                                <Circle className="h-3 w-3" />
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                        <p className={cn(`text-xs font-black uppercase tracking-wide ${theme.textMain}`, step.state === 'upcoming' ? theme.textMuted : '')}>
                            {step.label}
                        </p>
                        {step.description && (
                            <p className={`text-xs ${theme.textMuted} mt-1.5 leading-relaxed font-medium`}>{step.description}</p>
                        )}
                        {step.at && (
                            <p className={`text-[11px] ${theme.textMuted} font-semibold mt-1`}>{step.at}</p>
                        )}
                    </div>
                </li>
            ))}
        </ol>
    );
}