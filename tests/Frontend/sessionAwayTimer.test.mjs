import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/Lib/sessionAwayTimer.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { SessionAwayTimer } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

function fixture() {
    let time = 1000, id = 0;
    const tasks = new Map(), values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
    const advance = (milliseconds, runTimers = true) => {
        const target = time + milliseconds;
        if (runTimers) {
            while (true) {
                const next = [...tasks].filter(([, task]) => task.at <= target).sort((a, b) => a[1].at - b[1].at)[0];
                if (!next) break;
                tasks.delete(next[0]); time = next[1].at; next[1].callback();
            }
        }
        time = target;
    };
    const timer = (onExpire, overrides = {}) => new SessionAwayTimer({
        storage, key: 'account-session-away', graceMs: 120000, onExpire, now: () => time,
        schedule: (callback, delay) => { tasks.set(++id, { at: time + delay, callback }); return id; },
        cancel: handle => tasks.delete(handle), ...overrides,
    });
    return { storage, advance, timer };
}

test('a quick tab switch cancels the pending lock and does not lock later', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++);
    timer.start(); f.advance(30000); assert.equal(timer.resume(), true); f.advance(600000);
    assert.equal(locks, 0); assert.equal(timer.isAway, false);
});

test('the lock starts only at the two-minute boundary', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++);
    timer.start(); f.advance(119999); assert.equal(locks, 0); f.advance(1); assert.equal(locks, 1);
});

test('blur and visibilitychange cannot restart the departure timer', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++);
    assert.equal(timer.start(), true); f.advance(90000); assert.equal(timer.start(), false);
    f.advance(30000); assert.equal(locks, 1);
});

test('returning after a suspended background timer still requires the PIN', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++);
    timer.start(); f.advance(121000, false); assert.equal(locks, 0);
    assert.equal(timer.resume(), false); assert.equal(locks, 1);
});

test('reloading does not bypass an expired departure timestamp', () => {
    const f = fixture(); let locks = 0; const original = f.timer(() => locks++);
    original.start(); original.dispose(); f.advance(121000);
    const restored = f.timer(() => locks++); assert.equal(restored.resume(), false); assert.equal(locks, 1);
});

test('reloading within the grace period does not require a PIN', () => {
    const f = fixture(); let locks = 0; const original = f.timer(() => locks++);
    original.start(); original.dispose(); f.advance(30000);
    const restored = f.timer(() => locks++); assert.equal(restored.resume(), true);
    f.advance(180000); assert.equal(locks, 0);
});

test('visiting another portal tab cancels the first tab\'s pending lock', () => {
    const f = fixture(); let locks = 0; const first = f.timer(() => locks++), second = f.timer(() => locks++);
    first.start(); f.advance(30000); second.resume(); f.advance(180000);
    assert.equal(locks, 0); assert.equal(first.isAway, false);
});

test('one expired departure does not issue duplicate lock requests', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++);
    timer.start(); f.advance(120000); timer.sync(); timer.resume(); timer.sync(); assert.equal(locks, 1);
    timer.clear(); timer.start(); f.advance(120000); assert.equal(locks, 2);
});

test('the configured grace period is respected', () => {
    const f = fixture(); let locks = 0; const timer = f.timer(() => locks++, { graceMs: 60000 });
    timer.start(); f.advance(59999); assert.equal(locks, 0); f.advance(1); assert.equal(locks, 1);
});

test('a different login session does not inherit an earlier departure', () => {
    const f = fixture(); let locks = 0; const old = f.timer(() => locks++);
    old.start(); old.dispose(); f.advance(180000);
    const fresh = f.timer(() => locks++, { key: 'different-session-away' });
    assert.equal(fresh.resume(), true); assert.equal(locks, 0);
});
