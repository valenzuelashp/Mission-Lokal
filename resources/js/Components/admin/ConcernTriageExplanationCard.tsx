import { ChevronDown, ShieldCheck } from 'lucide-react';
import type { ConcernTriageExplanation } from '@/Types';

export default function ConcernTriageExplanationCard({ explanation }: { explanation: ConcernTriageExplanation | null }) {
    if (!explanation) return null;
    const sourceLabel = {
        gemini: 'AI assessment', local_rules: 'Local rule assessment', unknown: 'Assessment source unrecorded',
    }[explanation.analysis_source];

    return (
        <section className="space-y-4 rounded-2xl border border-blue-100 bg-white p-5 sm:p-6" aria-labelledby="severity-explanation-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="severity-explanation-heading" className="flex items-center gap-2 text-sm font-bold text-slate-900"><ShieldCheck className="h-4 w-4 text-blue-600" /> Why this severity?</h3>
                <span className="text-[11px] font-medium text-slate-500">{sourceLabel}</span>
            </div>
            <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-3">
                <div className="px-3"><dt className="text-[11px] text-slate-500">Initial risk</dt><dd className="mt-1 text-sm font-bold capitalize text-slate-900">{explanation.base_severity || 'Unrecorded'}</dd></div>
                <div className="px-3"><dt className="text-[11px] text-slate-500">Matched reporters</dt><dd className="mt-1 text-sm font-bold text-slate-900">{explanation.reporter_count ?? 'Unrecorded'}</dd></div>
                <div className="px-3"><dt className="text-[11px] text-slate-500">{explanation.staff_confirmed ? 'Staff confirmed' : 'Current severity'}</dt><dd className="mt-1 text-sm font-bold capitalize text-blue-800">{explanation.current_severity}</dd></div>
            </dl>
            <p className="text-sm leading-relaxed text-slate-700">{explanation.severity_reason || 'Severity is based on the available report and any matching reports. Review the evidence before confirming an action.'}</p>
            <details className="group border-t border-slate-100 pt-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md text-xs font-semibold text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                    <span>Assessment details{explanation.uncertainties.length > 0 ? ` · ${explanation.uncertainties.length} to verify` : ''}</span>
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 space-y-4">
                    <p className="text-xs leading-relaxed text-slate-600">
                        {explanation.community_severity
                            ? `${explanation.reporter_count} unique residents matched to this incident support a ${explanation.community_severity} report-count severity factor.`
                            : 'No report-count adjustment was recorded.'}
                        {explanation.staff_confirmed ? ' Staff have confirmed the current severity.' : ' The higher of the initial risk and report-count factor determines severity.'}
                    </p>
                    <div className="space-y-2"><h4 className="text-xs font-bold text-slate-900">Evidence noted</h4>
                        {explanation.evidence_summary.length > 0 ? <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-slate-600">{explanation.evidence_summary.map((fact, index) => <li key={index}>{fact}</li>)}</ul> : <p className="text-xs text-slate-500">No evidence summary was recorded.</p>}
                    </div>
                    {explanation.uncertainties.length > 0 && <div className="space-y-2 rounded-xl bg-amber-50 p-3"><h4 className="text-xs font-bold text-amber-950">Staff may verify</h4><ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-amber-950">{explanation.uncertainties.map((item, index) => <li key={index}>{item}</li>)}</ul><p className="text-xs text-amber-900">These uncertainties do not require a resident reply before staff can act.</p></div>}
                </div>
            </details>
        </section>
    );
}
