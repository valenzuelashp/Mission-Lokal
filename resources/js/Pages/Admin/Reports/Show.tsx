import '../../../../css/concern-review.css';
import { useEffect, useRef, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList, GitMerge, Image, MessageSquare, Search, ShieldAlert, Sparkles, X, Zap } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConcernClarificationPanel from '@/Components/admin/ConcernClarificationPanel';
import ConcernTriageExplanationCard from '@/Components/admin/ConcernTriageExplanationCard';
import { ReportDuplicateReview, ReportEvidence, ReportIncidentDetails, ReportResponsePlan } from '@/Components/admin/ReportReviewDetails';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { missionRef } from '@/Lib/missionRef';
import { cn } from '@/Lib/utils';
import { personnelDepartmentOptions, type PersonnelDepartmentKey } from '@/Lib/personnelDepartments';
import { initialVerdictAction, verdictBlocker, type ReportVerdictAction } from '@/Lib/reportVerdict';
import type { ConcernClarification } from '@/Types';

const staffActions = [
    { value: 'escalate', label: 'Deploy mission', icon: Zap },
    { value: 'merge', label: 'Merge duplicate', icon: GitMerge },
    { value: 'dismiss', label: 'Dismiss report', icon: X },
] as const;
const recommendationLabels: Record<string, string> = { escalate: 'Deploy a mission', merge: 'Compare and merge', dismiss: 'Review for dismissal', review: 'Staff review' };
const severityStyles: Record<string, string> = {
    low: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    medium: 'border-amber-200 bg-amber-50 text-amber-900',
    high: 'border-orange-200 bg-orange-50 text-orange-800',
    critical: 'border-red-200 bg-red-50 text-red-800',
};
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:ring-blue-500';

interface Props {
    report: any;
    masterCandidates?: { id: string; label: string }[];
    personnel?: { id: string; name: string; role: string; role_value?: string; department?: string; department_label?: string; shift_label?: string | null; subcategories?: string[] }[];
}

function departmentKey(department?: string | null): PersonnelDepartmentKey | undefined {
    return personnelDepartmentOptions.find(option => option.value === department || option.label === department)?.value;
}

export default function Show(props: Props) {
    return <ReportReview key={props.report.id} {...props} />;
}

function ReportReview({ report, personnel = [], masterCandidates = [] }: Props) {
    const [activeTab, setActiveTab] = useState('overview');
    const [personnelSearch, setPersonnelSearch] = useState('');
    const decisionPanel = useRef<HTMLElement>(null);
    const tabBar = useRef<HTMLDivElement>(null);
    const { data, setData, post, processing, errors } = useForm({
        concern_id: report.id,
        personnel_ids: (report.assigned_personnel_ids || []) as string[],
        department: report.department || '',
        confirmed_action: initialVerdictAction(report.ai_recommended_action),
        rejection_reason: report.ai_recommended_action === 'dismiss' ? report.ai_dismissal_reason || '' : '',
        master_concern_id: report.ai_duplicate_id || '',
        due_date: report.due_date || report.max_due_date || '',
    });
    useEffect(() => {
        if (!['queued', 'processing'].includes(report.reanalysis_status || '')) return;
        const timer = setInterval(() => router.reload({ only: ['report'] }), 5000);
        return () => clearInterval(timer);
    }, [report.reanalysis_status]);
    useEffect(() => {
        if (!report.ai_analysis_pending) return;
        const timer = setInterval(() => router.reload({ only: ['report'] }), 5000);
        return () => clearInterval(timer);
    }, [report.ai_analysis_pending]);

    useEffect(() => {
        const main = tabBar.current?.closest('main');
        const panel = document.getElementById(`review-panel-${activeTab}`);
        if (!main || !panel || !tabBar.current) return;
        const contentTop = panel.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
        const sectionTop = Math.max(0, contentTop - tabBar.current.offsetHeight - 16);
        // Returning from a long conversation should reveal the next section's start.
        if (main.scrollTop > sectionTop + 8) main.scrollTo({ top: sectionTop, behavior: 'smooth' });
    }, [activeTab]);

    const isTerminal = ['resolved', 'rejected', 'merged', 'closed'].includes(report.status);
    const hasMission = Boolean(report.mission);
    const canConfirm = report.can_confirm_verdict !== false;
    const selectedDepartment = departmentKey(data.department);
    const departmentPersonnel = personnel.filter(member => departmentKey(member.department) === selectedDepartment
        && (!report.is_vawc || ['vaw_desk', 'VAW Desk', 'VAW Desk · Confidential cases'].includes(member.role_value || '')));
    const visiblePersonnel = departmentPersonnel.filter(member => `${member.name} ${member.role}`.toLowerCase().includes(personnelSearch.trim().toLowerCase()));
    const submitBlocker = verdictBlocker({
        action: data.confirmed_action, canConfirm, department: selectedDepartment,
        eligiblePersonnelIds: departmentPersonnel.map(member => member.id), selectedPersonnelIds: data.personnel_ids,
        dueDate: data.due_date, masterConcernId: data.master_concern_id, rejectionReason: data.rejection_reason,
    });
    const clarifications: ConcernClarification[] = report.clarifications || [];
    const replied = clarifications.some(entry => entry.answered_at);
    const pending = clarifications.some(entry => !entry.answered_at);
    const duplicateCount = (report.merged_duplicates?.length || 0) + (report.ai_duplicate_id ? 1 : 0);
    const tabs = [
        { id: 'overview', label: 'Overview', icon: ClipboardList, count: null },
        { id: 'evidence', label: 'Evidence', icon: Image, count: report.images?.length || null },
        { id: 'duplicates', label: 'Duplicates', icon: GitMerge, count: duplicateCount || null },
        { id: 'clarification', label: 'Clarification', icon: MessageSquare, count: null },
    ];
    const jumpToDecision = () => {
        decisionPanel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        decisionPanel.current?.focus({ preventScroll: true });
    };
    const selectAction = (action: ReportVerdictAction) => {
        setData('confirmed_action', action);
        if (action === 'merge' && report.ai_duplicate_id) setActiveTab('duplicates');
    };
    const selectMerge = (id: string) => {
        setData({ ...data, confirmed_action: 'merge', master_concern_id: id });
        jumpToDecision();
    };

    return (
        <AdminLayout title={`Report ${String(report.id).slice(0, 8)}`}>
            <Head title={`Review: ${report.title || 'Incident'}`} />
            <div className="concern-review mx-auto w-full max-w-[1600px] space-y-5 pb-8">
                <header className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href="/admin/reports" className="inline-flex items-center gap-1.5 rounded text-xs font-semibold text-slate-500 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><ArrowLeft className="h-3.5 w-3.5" /> Report queue</Link>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold capitalize text-slate-600">{String(report.status || 'Pending').replaceAll('_', ' ')}</span>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0"><h1 className="break-words text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{report.title || 'Report review'}</h1><p className="mt-1 text-xs text-slate-500">#{String(report.id).slice(0, 8).toUpperCase()}{report.submitted_at ? ` · ${report.submitted_at}` : ''}</p></div>
                        <Button size="sm" variant="outline" className="shrink-0 lg:hidden" onClick={jumpToDecision}>Decision <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button>
                    </div>
                </header>

                {report.duplicate_of_id && <p className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs leading-relaxed text-purple-950"><GitMerge className="mr-2 inline h-4 w-4" />Merged into <Link href={`/admin/reports/${report.duplicate_of_id}`} className="font-bold underline">{report.duplicate_of_title || 'the original report'}</Link>.</p>}
                {Object.keys(errors).length > 0 && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800"><ShieldAlert className="h-4 w-4 shrink-0" /><div><p className="font-bold">The action could not be processed.</p><ul className="mt-1 list-disc pl-4">{Object.entries(errors).map(([field, message]) => <li key={field}>{message}</li>)}</ul></div></div>}

                <div className="grid items-start gap-5 lg:grid-cols-12">
                    <div className="min-w-0 space-y-4 lg:col-span-7 xl:col-span-8">
                        <div ref={tabBar} className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                            <div className="flex items-center justify-between gap-2 px-2 pb-2 pt-1"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><Sparkles className="h-4 w-4 text-blue-600" /> AI triage intelligence</h2><button type="button" onClick={jumpToDecision} className="rounded text-[11px] font-semibold text-blue-700 lg:hidden">Staff decision →</button></div>
                            <div role="tablist" aria-label="Report review sections" className="grid grid-cols-2 gap-1 sm:grid-cols-4">
                                {tabs.map((tab, index) => <button key={tab.id} id={`review-tab-${tab.id}`} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`review-panel-${tab.id}`} tabIndex={activeTab === tab.id ? 0 : -1}
                                    onClick={() => setActiveTab(tab.id)} onKeyDown={event => {
                                        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
                                        if (!offset && !['Home', 'End'].includes(event.key)) return;
                                        event.preventDefault();
                                        const target = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : tabs[(index + offset + tabs.length) % tabs.length];
                                        setActiveTab(target.id);
                                        document.getElementById(`review-tab-${target.id}`)?.focus();
                                    }}
                                    className={cn('flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600', activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900')}>
                                    <tab.icon className="hidden h-3.5 w-3.5 shrink-0 xl:block" /><span>{tab.label}{tab.id === 'clarification' && <span className="block text-[9px] font-normal opacity-80">Optional</span>}</span>{tab.count != null && <span className={cn('rounded px-1.5 text-[10px]', activeTab === tab.id ? 'bg-white/20' : 'bg-slate-100 text-slate-600')}>{tab.count}</span>}{tab.id === 'clarification' && replied && <span aria-label="Resident replied" className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />}
                                </button>)}
                            </div>
                        </div>

                        <div id="review-panel-overview" role="tabpanel" aria-labelledby="review-tab-overview" tabIndex={0} hidden={activeTab !== 'overview'} className="space-y-4 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                            {report.ai_duplicate_id && <button type="button" onClick={() => setActiveTab('duplicates')} className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left text-xs text-amber-950 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><GitMerge className="h-4 w-4 shrink-0" /><span className="flex-1"><strong>Possible duplicate found.</strong> Compare the two reports before acting.</span><ArrowRight className="h-4 w-4 shrink-0" /></button>}
                            <ReportIncidentDetails report={report} />
                            <ConcernTriageExplanationCard explanation={report.triage_explanation || null} />
                            <ReportResponsePlan report={report} />
                            <button type="button" onClick={() => setActiveTab('clarification')} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/50 p-3 text-left text-xs text-slate-600 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><MessageSquare className="h-4 w-4 shrink-0" /><span className="flex-1"><strong className="font-semibold text-slate-700">Optional clarification</strong><span className="mt-0.5 block">{replied ? 'A resident reply is available to review.' : pending ? 'Awaiting a reply. You can still process this report.' : 'Ask for more details only if they would help.'}</span></span><ArrowRight className="h-4 w-4 shrink-0" /></button>
                        </div>
                        <div id="review-panel-evidence" role="tabpanel" aria-labelledby="review-tab-evidence" tabIndex={0} hidden={activeTab !== 'evidence'} className="rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><ReportEvidence report={report} /></div>
                        <div id="review-panel-duplicates" role="tabpanel" aria-labelledby="review-tab-duplicates" tabIndex={0} hidden={activeTab !== 'duplicates'} className="rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"><ReportDuplicateReview report={report} canMerge={canConfirm && !hasMission && !isTerminal && !processing} onSelectMerge={selectMerge} /></div>
                        <div id="review-panel-clarification" role="tabpanel" aria-labelledby="review-tab-clarification" tabIndex={0} hidden={activeTab !== 'clarification'} className="rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                            <ConcernClarificationPanel key={report.id} concernId={report.id} quality={report.report_quality} missingDetails={report.missing_details || []} suggestedQuestions={report.follow_up_questions || []} clarifications={clarifications} canRequest={Boolean(report.can_request_clarification)} repliesOpen={Boolean(report.clarification_replies_open)} canReanalyse={Boolean(report.can_reanalyse)} reanalysisStatus={report.reanalysis_status} reanalysisError={report.reanalysis_error} />
                        </div>
                    </div>

                    <aside ref={decisionPanel} id="staff-decision" tabIndex={-1} aria-labelledby="decision-heading" className="scroll-mt-28 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 lg:sticky lg:top-0 lg:col-span-5 lg:flex lg:max-h-[calc(100dvh-13.5rem)] lg:flex-col xl:col-span-4">
                        <div className="review-decision-header shrink-0 space-y-3 border-b border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 sm:p-5">
                            <div className="flex items-center justify-between gap-2"><h2 id="decision-heading" className="text-sm font-bold text-slate-900">Staff decision</h2><span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{hasMission || isTerminal ? 'Processed' : 'Approval required'}</span></div>
                            <div className="flex flex-wrap items-center gap-2"><span className={cn('rounded-lg border px-3 py-1 text-sm font-bold capitalize', severityStyles[report.severity] || 'border-slate-200 bg-slate-50 text-slate-700')}>{report.severity ? `${report.severity} severity` : report.ai_analysis_pending ? 'Awaiting AI assessment' : 'AI assessment unavailable'}</span>{report.severity && <span className="text-[11px] text-slate-500">{report.triage_explanation?.staff_confirmed ? 'Staff confirmed' : 'AI assessment; staff review required'}</span>}</div>
                            {!hasMission && !isTerminal && <div>{report.ai_recommended_action ? <><p className="text-xs font-bold text-blue-900">AI recommendation: {recommendationLabels[report.ai_recommended_action] || 'Staff review'}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{report.ai_action_reason}</p></> : <><p className="text-xs font-bold text-blue-900">{report.ai_analysis_missing ? 'AI assessment unavailable' : 'AI assessment pending'}</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{report.ai_analysis_missing ? 'No analysis was saved. Review the concern manually or request a new analysis.' : 'The AI recommendation will appear here after analysis finishes. You can still review the concern and choose a staff action.'}</p></>}</div>}
                        </div>

                        {hasMission ? <div className="space-y-4 overflow-y-auto p-5">
                            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-5 w-5" /> Mission dispatched</div>
                            <p className="text-xs leading-relaxed text-slate-500">Mission {missionRef(String(report.mission.id))} is {String(report.mission.status).replaceAll('_', ' ')}.{report.mission.due_date ? ` Due ${report.mission.due_date}.` : ''}</p>
                            <div className="space-y-2"><h3 className="text-xs font-semibold text-slate-700">Assigned personnel</h3>{(report.assigned_personnel || []).map((person: any) => <p key={person.id} className="rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-800">{person.name}<span className="mt-1 block font-normal text-slate-500">{person.role}</span></p>)}</div>
                            <Button variant="outline" size="sm" className="w-full" asChild><Link href={`/admin/missions/${report.mission.id}`}>Manage mission <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                        </div> : isTerminal ? <div className="space-y-3 p-5"><p className="text-sm font-semibold text-slate-700">This report has been processed.</p><p className="text-xs text-slate-500">You can still review the assessment and supporting details.</p><Link href="/admin/reports" className="inline-flex text-xs font-bold text-blue-700">Return to report queue →</Link></div> : (
                            <form className="flex min-h-0 flex-1 flex-col" onSubmit={event => { event.preventDefault(); if (!processing && !submitBlocker) post(`/admin/reports/${report.id}/confirm-ai-verdict`, { preserveScroll: true }); }}>
                                <div className="review-decision-fields min-h-0 flex-1 lg:overflow-y-auto" role="region" aria-label="Staff decision fields" tabIndex={0}>
                                <fieldset aria-label="Staff action and assignment" disabled={processing || !canConfirm} className="min-w-0 space-y-4 p-4 sm:p-5">
                                    <div className="space-y-2"><p className="text-xs font-bold text-slate-700">Choose staff action</p><div className="grid grid-cols-3 gap-1.5">{staffActions.map(action => <button key={action.value} type="button" aria-pressed={data.confirmed_action === action.value} onClick={() => selectAction(action.value)} className={cn('flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-[11px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60', data.confirmed_action === action.value ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500 hover:border-blue-300')}><action.icon className="h-4 w-4" />{action.label}</button>)}</div></div>
                                    {data.confirmed_action === 'escalate' && <>
                                        <div className="space-y-1.5"><label htmlFor="mission-department" className="text-xs font-semibold text-slate-700">Department</label><select id="mission-department" className={fieldClass} value={selectedDepartment || ''} required onChange={event => { setData({ ...data, department: event.target.value, personnel_ids: [] }); setPersonnelSearch(''); }}><option value="">Choose a department</option>{personnelDepartmentOptions.map(department => <option key={department.value} value={department.value}>{department.label}</option>)}</select></div>
                                        {report.is_vawc && <p className="rounded-lg bg-rose-50 p-3 text-xs leading-relaxed text-rose-900">Confidential VAWC concerns can only be assigned to Peace &amp; Order VAW Desk personnel.</p>}
                                        <div className="space-y-2"><div className="flex justify-between gap-2 text-xs"><h3 className="font-semibold text-slate-700">Assign personnel</h3><span className="text-slate-500">{data.personnel_ids.length} selected · {departmentPersonnel.length} active</span></div>
                                            {departmentPersonnel.length > 5 && <div className="relative"><Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" /><input type="search" aria-label="Search personnel" value={personnelSearch} onChange={event => setPersonnelSearch(event.target.value)} placeholder="Search personnel" className={cn(fieldClass, 'pl-9')} /></div>}
                                            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                                                {visiblePersonnel.length > 0 ? visiblePersonnel.map(person => <label key={person.id} className={cn('flex cursor-pointer items-center gap-2.5 p-3 text-xs first:rounded-t-xl last:rounded-b-xl', data.personnel_ids.includes(person.id) ? 'bg-blue-50/70' : 'hover:bg-slate-50')}><input type="checkbox" checked={data.personnel_ids.includes(person.id)} onChange={() => setData('personnel_ids', data.personnel_ids.includes(person.id) ? data.personnel_ids.filter(id => id !== person.id) : [...data.personnel_ids, person.id])} className="h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500" /><span className="min-w-0 flex-1"><span className="block font-semibold text-slate-800">{person.name}</span><span className="mt-0.5 block text-[10px] leading-relaxed text-slate-500">{person.role}{person.shift_label ? ` · ${person.shift_label}` : ''}</span></span>{report.assigned_personnel_ids?.includes(person.id) && <span className="shrink-0 text-[9px] font-bold text-blue-600">Suggested</span>}</label>) : <p className="p-3 text-xs leading-relaxed text-slate-500">{!selectedDepartment ? 'Choose a department to view personnel.' : personnelSearch ? 'No matching personnel. Try another name.' : 'No eligible active personnel in this department.'}</p>}
                                            </div>
                                        </div>
                                        <div className="space-y-1.5"><label htmlFor="mission-due-date" className="text-xs font-semibold text-slate-700">Mission due date</label><Input id="mission-due-date" type="date" value={data.due_date} max={report.max_due_date} onChange={event => setData('due_date', event.target.value)} required className={fieldClass} /></div>
                                    </>}
                                    {data.confirmed_action === 'merge' && <div className="space-y-2"><label htmlFor="master-concern" className="text-xs font-semibold text-slate-700">Original report</label><select id="master-concern" value={data.master_concern_id} onChange={event => setData('master_concern_id', event.target.value)} required className={fieldClass}><option value="">Choose the original report</option>{report.ai_duplicate_id && masterCandidates.some(candidate => candidate.id === report.ai_duplicate_id) && <option value={report.ai_duplicate_id}>[Suggested] {report.ai_duplicate_title || 'Possible original report'}</option>}{masterCandidates.filter(candidate => candidate.id !== report.id && candidate.id !== report.ai_duplicate_id).map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}</select><p className="text-xs leading-relaxed text-slate-500">Merge only after confirming that both reports describe the same incident.</p><button type="button" onClick={() => setActiveTab('duplicates')} className="text-xs font-semibold text-blue-700 underline underline-offset-2">Compare related reports</button></div>}
                                    {data.confirmed_action === 'dismiss' && <div className="space-y-2"><label htmlFor="rejection-reason" className="text-xs font-semibold text-slate-700">Reason for dismissal</label><textarea id="rejection-reason" value={data.rejection_reason} onChange={event => setData('rejection_reason', event.target.value)} required minLength={3} maxLength={1000} rows={3} className={fieldClass} /><p className="text-xs leading-relaxed text-slate-500">Explain the staff decision. Missing details alone do not establish spam.</p></div>}
                                </fieldset>
                                </div>
                                <div className="review-decision-footer relative shrink-0 space-y-2 border-t border-slate-200 bg-white p-4">
                                    <p id="verdict-submit-requirements" role="status" className="text-[11px] leading-relaxed text-slate-500">{submitBlocker || 'Ready to confirm. A resident reply is not required.'}</p>
                                    <Button type="submit" disabled={processing || submitBlocker !== null} aria-describedby="verdict-submit-requirements" className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700"><CheckCircle2 className="mr-2 h-4 w-4" />{processing ? 'Processing...' : data.confirmed_action === 'escalate' ? 'Confirm & dispatch mission' : data.confirmed_action === 'merge' ? 'Confirm merge' : data.confirmed_action === 'dismiss' ? 'Confirm dismissal' : 'Choose an action to continue'}</Button>
                                </div>
                            </form>
                        )}
                    </aside>
                </div>
            </div>
        </AdminLayout>
    );
}
