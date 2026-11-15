export type ReportVerdictAction = 'escalate' | 'merge' | 'dismiss';

export function initialVerdictAction(recommendation: unknown): ReportVerdictAction | '' {
    return recommendation === 'escalate' || recommendation === 'merge' || recommendation === 'dismiss'
        ? recommendation : '';
}

interface VerdictRequirements {
    action: string;
    canConfirm: boolean;
    department?: string;
    eligiblePersonnelIds: string[];
    selectedPersonnelIds: string[];
    dueDate: string;
    masterConcernId: string;
    rejectionReason: string;
}

export function verdictBlocker(input: VerdictRequirements): string | null {
    if (!input.canConfirm) return 'This account has view-only access and cannot confirm a verdict.';
    if (!initialVerdictAction(input.action)) return 'Choose a staff action above to continue.';
    if (input.action === 'escalate') {
        if (!input.department) return 'Choose a department to see its active personnel.';
        if (input.eligiblePersonnelIds.length === 0) return 'No eligible active personnel are listed for this department.';
        if (input.selectedPersonnelIds.length === 0) return 'Select at least one personnel member to enable mission dispatch.';
        if (input.selectedPersonnelIds.some(id => !input.eligiblePersonnelIds.includes(id))) return 'Select personnel from the chosen department.';
        if (!input.dueDate) return 'Choose a mission due date to continue.';
    }
    if (input.action === 'merge' && !input.masterConcernId) return 'Choose the original report before confirming a merge.';
    if (input.action === 'dismiss' && input.rejectionReason.trim().length < 3) return 'Enter a reason for dismissing this report.';

    return null;
}
