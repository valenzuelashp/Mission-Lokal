import type { ConcernTriageExplanation } from '@/Types';

export default function ConcernTriageExplanationCard({ explanation }: { explanation: ConcernTriageExplanation | null }) {
    if (!explanation) return null;

    const sourceLabel = {
        gemini: 'Gemini assessment',
        local_rules: 'Local rule assessment',
        unknown: 'Assessment source not recorded',
    }[explanation.analysis_source];

    return (
        <section className="space-y-4 rounded-2xl border border-blue-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-black text-slate-900">Why this severity?</h4>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700">{sourceLabel}</span>
            </div>
            <dl className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-3">
                    <dt className="text-[10px] font-bold text-slate-500">Initial assessment</dt>
                    <dd className="mt-1 text-sm font-black capitalize text-slate-900">{explanation.base_severity ?? 'Unrecorded'}</dd>
                </div>
                <div className="rounded-xl bg-amber-50 p-3">
                    <dt className="text-[10px] font-bold text-amber-800">Matched reporters</dt>
                    <dd className="mt-1 text-sm font-black text-amber-950">{explanation.reporter_count ?? 'Unrecorded'}</dd>
                </div>
                <div className="rounded-xl bg-blue-50 p-3">
                    <dt className="text-[10px] font-bold text-blue-800">{explanation.staff_confirmed ? 'Staff confirmed' : 'Current severity'}</dt>
                    <dd className="mt-1 text-sm font-black capitalize text-blue-950">{explanation.current_severity}</dd>
                </div>
            </dl>
            <p className="text-xs leading-relaxed text-slate-600">
                {explanation.community_severity
                    ? `${explanation.reporter_count} unique residents matched to this incident support a ${explanation.community_severity} report-count severity factor.`
                    : 'No report-count adjustment was recorded for this assessment.'}
                {explanation.staff_confirmed
                    ? ' The current severity is confirmed by staff.'
                    : ' The higher of the initial assessment and the report-count factor determines severity.'}
            </p>
            <p className="text-xs leading-relaxed text-slate-700">{explanation.severity_reason ?? 'A detailed severity explanation was not recorded for this analysis.'}</p>
            <div className="space-y-2 border-t border-slate-100 pt-3">
                <h5 className="text-xs font-bold text-slate-900">Evidence noted in the analysis</h5>
                {explanation.evidence_summary.length > 0 ? (
                    <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-slate-700">
                        {explanation.evidence_summary.map((fact, index) => <li key={index}>{fact}</li>)}
                    </ul>
                ) : <p className="text-xs text-slate-500">No evidence summary was recorded.</p>}
            </div>
            {explanation.uncertainties.length > 0 && (
                <div className="space-y-2 rounded-xl bg-amber-50 p-3">
                    <h5 className="text-xs font-bold text-amber-950">Needs verification</h5>
                    <ul className="list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-amber-950">
                        {explanation.uncertainties.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                </div>
            )}
        </section>
    );
}
