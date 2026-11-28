import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChevronDown, GitMerge, MapPin, User } from 'lucide-react';
import MapView from '@/Components/maps/MapView';
import { Button } from '@/Components/ui/button';
import { TAMBO_CENTER } from '@/Lib/mapUtils';
import { cn } from '@/Lib/utils';

const card = 'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6';

export function ReportIncidentDetails({ report }: { report: any }) {
    const [mapOpen, setMapOpen] = useState(false);
    const lat = Number(report.lat) || TAMBO_CENTER[0];
    const lng = Number(report.lng) || TAMBO_CENTER[1];
    return (
        <section className={cn(card, 'space-y-4')} aria-labelledby="incident-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id="incident-heading" className="text-sm font-bold text-slate-900">What was reported</h3>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{report.category || 'Community concern'}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{report.description || 'No description was provided.'}</p>
            {report.category_realignment_reason && <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950"><strong>Category realigned: </strong>{report.category_realignment_reason}</div>}
            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><strong>Routing: </strong>{report.routed_department || report.department || 'Awaiting analysis'}{report.routed_roles?.length > 0 && ` · ${report.routed_roles.join(', ')}`}</div>
            {report.scope_reason && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">{report.scope_reason}</div>}
            {report.scope_status === 'needs_review' && <Button type="button" variant="outline" onClick={() => router.post(`/admin/reports/${report.id}/review-scope`, { confirmed_non_emergency: true }, { preserveScroll: true })}>Confirm reviewed as non-emergency</Button>}
            {report.routed_department === 'Admin Triage' && report.scope_status === 'in_scope' && ['ai_processed', 'under_review'].includes(report.status) && <Button type="button" variant="outline" onClick={() => router.post(`/admin/reports/${report.id}/confirm-ai`, {}, { preserveScroll: true })}>Confirm for Admin Triage</Button>}
            <details className="group border-t border-slate-100 pt-4" onToggle={event => setMapOpen(event.currentTarget.open)}>
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md text-xs font-semibold text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="min-w-0 flex-1 break-words">{report.location_label || 'Pinned location'}</span>
                    <span className="text-blue-700">View map</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                    {mapOpen && <MapView center={[lat, lng]} pins={[{ id: report.id, lat, lng, title: report.title, severity: report.severity || 'medium' }]} className="relative z-0 h-64 w-full" />}
                </div>
            </details>
            {report.intake && (
                <details className="group rounded-xl border border-cyan-100 bg-cyan-50/50 p-3">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs font-bold text-cyan-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden">
                        Restricted {report.intake.channel === 'walk_in' ? 'walk-in' : 'phone'} intake details
                        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                        {[
                            ['Resident name', report.intake.caller_name], ['Phone', report.intake.caller_phone],
                            ['Address / callback details', report.intake.caller_address], ['Logged by', report.intake.logged_by],
                            ['Incident time', report.intake.incident_occurred_at],
                        ].map(([label, value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-900">{value || 'Not provided'}</dd></div>)}
                    </dl>
                </details>
            )}
        </section>
    );
}

export function ReportResponsePlan({ report }: { report: any }) {
    const steps = Array.isArray(report.prescriptive_steps) ? report.prescriptive_steps : [];
    const plan = report.triage_explanation?.response_plan;
    const source = ({ playbook: 'Barangay playbook', gemini: 'AI draft', local_rules: 'Local response template', safeguarding: 'Confidential safeguarding procedure' } as Record<string, string>)[plan?.source] || 'Suggested steps';
    return (
        <section className={card} aria-labelledby="response-plan-heading">
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1"><h3 id="response-plan-heading" className="text-sm font-bold text-slate-900">Response plan</h3><p className="mt-1 text-xs text-slate-500">{plan?.playbook_title || source}</p></div>
                <span className="shrink-0 text-xs font-semibold text-slate-500">{steps.length} steps</span>
            </div>
            <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                <p className="text-xs text-slate-500">{source}. For assigned personnel{report.mission ? '.' : ', subject to staff approval.'}</p>
                {steps.length > 0 ? <ol className="space-y-3">{steps.map((step: any, index: number) => (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-slate-700"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span><span>{typeof step === 'string' ? step : step?.step || step?.title || step?.instruction || step?.action || JSON.stringify(step)}</span></li>
                ))}</ol> : <p className="text-sm text-slate-500">{report.ai_analysis_pending
                    ? 'AI assessment is queued or processing. The response plan will appear here when the worker finishes.'
                    : report.ai_analysis_missing
                        ? 'AI processing is marked complete, but no current analysis or response plan was saved. Review the report manually or re-run analysis if available.'
                        : 'No response steps were recorded.'}</p>}
            </div>
        </section>
    );
}

export function ReportEvidence({ report }: { report: any }) {
    const images: string[] = report.images || [];
    return (
        <section className={cn(card, 'space-y-4')} aria-labelledby="evidence-heading">
            <div><h3 id="evidence-heading" className="text-sm font-bold text-slate-900">Photo evidence</h3><p className="mt-1 text-xs text-slate-500">Compare each photo with the resident's report.</p></div>
            {report.image_review_needed && <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-950">Some photos are unclear, unrelated, partly relevant, or were not analyzed. Review them manually; this does not establish misuse.</p>}
            {images.length === 0 ? <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No photos were attached to this report.</p> : (
                <div className="grid gap-4 sm:grid-cols-2">{images.map((url, index) => {
                    const number = index + 1;
                    const assessment = report.image_assessments?.find((item: any) => item.image_number === number);
                    const analyzed = Array.isArray(report.images_analyzed_numbers) ? report.images_analyzed_numbers.includes(number) : number <= (report.images_analyzed_count || 0);
                    const label = ({ relevant: 'Relevant', partially_relevant: 'Partly relevant', unrelated: 'Unrelated', unclear: 'Unclear' } as Record<string, string>)[assessment?.relevance] || 'Needs review';
                    return <div key={url} className="overflow-hidden rounded-xl border border-slate-200">
                        <a href={url} target="_blank" rel="noreferrer" aria-label={`Open evidence photo ${number} at full size`} className="block bg-slate-50"><img src={url} alt={`Evidence photo ${number}`} className="h-52 w-full object-contain" loading="lazy" /></a>
                        <div className="space-y-2 p-4"><div className="flex justify-between gap-2 text-xs"><span className="font-bold text-slate-900">Photo {number}</span><span className={cn('font-semibold', assessment?.relevance === 'relevant' ? 'text-emerald-700' : 'text-amber-800')}>{label}</span></div>
                            {assessment ? <>{assessment.observation && <p className="text-xs leading-relaxed text-slate-700">{assessment.observation}</p>}{assessment.reason && <p className="text-xs leading-relaxed text-slate-500">{assessment.reason}</p>}</> : <p className="text-xs text-slate-500">{analyzed ? 'No assessment returned. Review manually.' : 'Not analyzed. Review manually.'}</p>}
                        </div>
                    </div>;
                })}</div>
            )}
        </section>
    );
}

export function ReportDuplicateReview({ report, onSelectMerge, canMerge }: { report: any; onSelectMerge: (id: string) => void; canMerge: boolean }) {
    const merged = report.merged_duplicates || [];
    return (
        <section className={cn(card, 'space-y-5')} aria-labelledby="duplicates-heading">
            <div><h3 id="duplicates-heading" className="text-sm font-bold text-slate-900">Compare related reports</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">Check that the place, timing, and issue describe the same incident before merging.</p></div>
            {report.ai_duplicate_id && <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950"><span className="flex items-center gap-2"><GitMerge className="h-4 w-4" /> Possible duplicate</span>{report.ai_duplicate_similarity != null && <span>{Math.round(report.ai_duplicate_similarity * 100)}% similarity</span>}</div>
                <div className="grid gap-3 sm:grid-cols-2">{[
                    { label: 'This report', title: report.title, description: report.description },
                    { label: 'Possible original', title: report.ai_duplicate_title, description: report.ai_duplicate_description },
                ].map(item => <div key={item.label} className="space-y-2 rounded-xl border border-slate-200 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{item.label}</p><h4 className="break-words text-sm font-bold text-slate-900">{item.title || 'Related report'}</h4><p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">{item.description || 'Open the original report for more details.'}</p></div>)}</div>
                {report.ai_duplicate_reporter && <p className="text-xs text-slate-500">Original reporter: {report.ai_duplicate_reporter}{report.ai_duplicate_reporter_count != null ? ` · ${report.ai_duplicate_reporter_count} matched reporters` : ''}</p>}
                {report.ai_duplicate_context && <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600"><p>{report.ai_duplicate_context.distance_meters} m apart · {report.ai_duplicate_context.time_gap_hours} hours apart · {report.ai_duplicate_context.window_hours}-hour matching window</p><p>Shared terms: {(report.ai_duplicate_context.shared_terms || []).join(', ') || 'Not recorded'}.</p><p>{report.ai_duplicate_context.time_basis === 'incident_time' ? 'Compared reported incident times.' : 'Submission time was used where incident time was missing.'} Staff must confirm the match.</p></div>}
                <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" asChild><Link href={`/admin/reports/${report.ai_duplicate_id}`}>Open original report</Link></Button><Button size="sm" disabled={!canMerge} onClick={() => onSelectMerge(report.ai_duplicate_id)}><GitMerge className="mr-2 h-4 w-4" /> Select for merge</Button></div>
            </div>}
            {report.duplicate_of_id && <p className="rounded-xl bg-purple-50 p-4 text-sm text-purple-950">This report was merged into <Link className="font-bold underline" href={`/admin/reports/${report.duplicate_of_id}`}>{report.duplicate_of_title || 'the original report'}</Link>.</p>}
            {merged.length > 0 && <div className="space-y-3 border-t border-slate-100 pt-4"><h4 className="text-xs font-bold text-slate-900">Confirmed merges ({merged.length})</h4>{merged.map((duplicate: any) => <details key={duplicate.id} className="group rounded-xl border border-slate-200 p-4">
                <summary className="flex cursor-pointer list-none items-start gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 [&::-webkit-details-marker]:hidden"><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold text-slate-900">{duplicate.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><User className="h-3 w-3 shrink-0" /> {duplicate.reporter_name || 'Resident'} · {duplicate.submitted_at}</p></div><ChevronDown className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" /></summary>
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-3"><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{duplicate.description}</p>{duplicate.reporter_mobile && <p className="text-xs text-slate-500">Contact: {duplicate.reporter_mobile}</p>}<Link href={`/admin/reports/${duplicate.id}`} className="text-xs font-semibold text-blue-700 underline">View full report</Link></div>
            </details>)}</div>}
            {!report.ai_duplicate_id && !report.duplicate_of_id && merged.length === 0 && <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No suggested or confirmed duplicates for this report.</p>}
        </section>
    );
}
