import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/Lib/reportVerdict.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { initialVerdictAction, verdictBlocker } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const ready = {
    action: 'escalate', canConfirm: true, department: 'peace_order',
    eligiblePersonnelIds: ['tanod-1', 'tanod-2'], selectedPersonnelIds: ['tanod-1'],
    dueDate: '2026-11-20', masterConcernId: '', rejectionReason: '',
};

test('a review recommendation requires a clearly identified staff action, not more personnel', () => {
    assert.equal(initialVerdictAction('review'), '');
    assert.match(verdictBlocker({ ...ready, action: initialVerdictAction('review') }), /staff action/);
    assert.equal(verdictBlocker({ ...ready, action: 'escalate' }), null);
});
test('valid AI action recommendations remain preselected', () => {
    for (const action of ['escalate', 'merge', 'dismiss']) assert.equal(initialVerdictAction(action), action);
    assert.equal(initialVerdictAction(undefined), '');
});
test('available personnel still require a selected assignee', () => {
    assert.match(verdictBlocker({ ...ready, selectedPersonnelIds: [] }), /Select at least one personnel/);
});
test('an empty department and a department with no eligible personnel have different explanations', () => {
    assert.match(verdictBlocker({ ...ready, department: undefined }), /Choose a department/);
    assert.match(verdictBlocker({ ...ready, eligiblePersonnelIds: [] }), /No eligible active personnel/);
});
test('stale personnel selections cannot enable dispatch for another department', () => {
    assert.match(verdictBlocker({ ...ready, selectedPersonnelIds: ['different-department'] }), /chosen department/);
});
test('dispatch requires its due date', () => {
    assert.match(verdictBlocker({ ...ready, dueDate: '' }), /due date/);
});
test('merge requires a primary report but does not require personnel', () => {
    assert.match(verdictBlocker({ ...ready, action: 'merge', selectedPersonnelIds: [] }), /original report/);
    assert.equal(verdictBlocker({ ...ready, action: 'merge', masterConcernId: 'primary', selectedPersonnelIds: [] }), null);
});
test('dismissal requires a written reason rather than personnel', () => {
    assert.match(verdictBlocker({ ...ready, action: 'dismiss', rejectionReason: '  ' }), /reason/);
    assert.equal(verdictBlocker({ ...ready, action: 'dismiss', rejectionReason: 'Staff verified this is a test report.', selectedPersonnelIds: [] }), null);
});
test('view-only accounts cannot confirm any action', () => {
    assert.match(verdictBlocker({ ...ready, canConfirm: false }), /view-only/);
});
