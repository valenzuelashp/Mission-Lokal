import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { afterEach, test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/Lib/barangayHelp.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { requestHelp, HelpRequestError, trustedSourceUrl } = await import('data:text/javascript;base64,' + Buffer.from(compiled.outputText).toString('base64'));
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

function json(body, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

test('questions retain CSRF protection and same-origin session credentials', async () => {
    let received;
    globalThis.fetch = async (url, options) => {
        received = { url, ...options };
        return json({ messages: [] });
    };
    await requestHelp('POST', { question: 'Paano po?' }, 'csrf-test');
    assert.equal(received.url, '/help');
    assert.equal(received.credentials, 'same-origin');
    assert.equal(received.cache, 'no-store');
    assert.equal(received.headers['X-CSRF-TOKEN'], 'csrf-test');
    assert.equal(received.headers.Accept, 'application/json');
    assert.deepEqual(JSON.parse(received.body), { question: 'Paano po?' });
});

test('safe fallback messages remain usable when AI assistance is unavailable', async () => {
    const messages = [{ id: 'reply', role: 'assistant', content: 'General guidance.', basis: 'general', status: 'unavailable' }];
    globalThis.fetch = async () => json({ messages, reply: messages[0] }, 503);
    assert.deepEqual((await requestHelp('POST', {}, 'csrf')).messages, messages);
});

test('database errors have a service message without echoing server diagnostics', async () => {
    globalThis.fetch = async () => json({ error: { code: 'records_unavailable', message: 'SECRET_SQL_DETAILS' } }, 503);
    await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error instanceof HelpRequestError
        && error.code === 'service' && !error.message.includes('SECRET_SQL_DETAILS'));
});

test('HTML debug pages and malformed JSON never appear as chatbot answers', async () => {
    for (const response of [
        new Response('<h1>SECRET_STACK_TRACE</h1>', { status: 500, headers: { 'content-type': 'text/html' } }),
        new Response('{invalid SECRET_STACK_TRACE', { headers: { 'content-type': 'application/json' } }),
    ]) {
        globalThis.fetch = async () => response;
        await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error.code === 'service' && !error.message.includes('SECRET_'));
    }
});

test('expired authentication and CSRF tokens prompt the resident to sign in again', async () => {
    for (const status of [401, 403, 419]) {
        globalThis.fetch = async () => json({}, status);
        await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error.code === 'session');
    }
    globalThis.fetch = async () => ({ redirected: true, status: 200 });
    await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error.code === 'session');
});

test('resident request throttling is distinguished from unavailable AI service', async () => {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return json({}, 429); };
    await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error.code === 'limit');
    assert.equal(calls, 1);
});

test('validation feedback is retained without displaying unrelated server error fields', async () => {
    globalThis.fetch = async () => json({ errors: { question: ['Please enter a question.'] }, exception: 'SECRET' }, 422);
    await assert.rejects(requestHelp('POST', {}, 'csrf'), error => error.code === 'validation' && error.message === 'Please enter a question.');
});

test('clearing a conversation uses an authenticated CSRF-protected DELETE', async () => {
    let received;
    globalThis.fetch = async (_url, options) => { received = options; return json({ messages: [] }); };
    assert.deepEqual(await requestHelp('DELETE', {}, 'csrf'), { messages: [] });
    assert.equal(received.method, 'DELETE');
    assert.equal(received.headers['X-CSRF-TOKEN'], 'csrf');
});

test('source links are restricted to existing public application destinations', () => {
    assert.equal(trustedSourceUrl('/library#library-123e4567-e89b-12d3-a456-426614174000'), true);
    assert.equal(trustedSourceUrl('/documents'), true);
    for (const url of ['https://example.com', 'javascript:alert(1)', '//example.com', '/admin/residents', '/library#bad']) {
        assert.equal(trustedSourceUrl(url), false);
    }
});

test('cached pages refresh canonical history without sending a GET request body', async () => {
    let received;
    globalThis.fetch = async (_url, options) => {
        received = options;
        return json({ messages: [], csrfToken: 'fresh-csrf' });
    };
    const result = await requestHelp('GET', {}, 'cached-csrf');
    assert.equal(received.method, 'GET');
    assert.equal(received.body, undefined);
    assert.equal(received.credentials, 'same-origin');
    assert.equal(result.csrfToken, 'fresh-csrf');
});
