import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/Lib/concernPhotos.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { captureConcernPhoto, concernCameraError, prefersNativeConcernCamera, MAX_CONCERN_PHOTO_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);

function captureFixture({ width = 1920, height = 1080, readyState = 4, blob = new Blob(['camera-frame'], { type: 'image/jpeg' }), context = true } = {}) {
    const source = { videoWidth: width, videoHeight: height, readyState };
    let drawn = null;
    const canvas = {
        width: 0, height: 0,
        getContext: () => context ? { drawImage: (...args) => { drawn = args; } } : null,
        toBlob: callback => callback(blob),
    };
    return { source, canvas, capture: () => captureConcernPhoto(source, () => canvas), get drawn() { return drawn; } };
}

test('laptops, including touch-screen Windows laptops, open the live webcam', () => {
    for (const device of [
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32', maxTouchPoints: 0 },
        { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', platform: 'Win32', maxTouchPoints: 10 },
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel', maxTouchPoints: 0 },
        { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: 'Linux x86_64', maxTouchPoints: 0 },
    ]) assert.equal(prefersNativeConcernCamera(device), false);
});

test('phones and iPads retain native camera capture', () => {
    for (const device of [
        { userAgent: 'Mozilla/5.0 (Linux; Android 14)', platform: 'Linux armv8l', maxTouchPoints: 5 },
        { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', platform: 'iPhone', maxTouchPoints: 5 },
        { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel', maxTouchPoints: 5 },
    ]) assert.equal(prefersNativeConcernCamera(device), true);
});

test('permission, missing-camera, and busy-camera errors provide actionable recovery', () => {
    assert.match(concernCameraError({ name: 'NotAllowedError' }), /Allow camera access/);
    assert.match(concernCameraError({ name: 'NotFoundError' }), /Connect or enable your webcam/);
    assert.match(concernCameraError({ name: 'NotReadableError' }), /Close other apps/);
    assert.match(concernCameraError(null), /upload a photo instead/);
    assert.doesNotMatch(concernCameraError({ name: 'Unknown', message: 'Private diagnostic data' }), /Private diagnostic/);
});

test('a webcam frame becomes a JPEG file with a bounded, proportional size', async () => {
    const fixture = captureFixture();
    const photo = await fixture.capture();
    assert.equal(photo.type, 'image/jpeg');
    assert.match(photo.name, /^concern-camera-\d+\.jpg$/);
    assert.deepEqual([fixture.canvas.width, fixture.canvas.height], [1600, 900]);
    assert.equal(fixture.drawn[0], fixture.source);
    assert.deepEqual(fixture.drawn.slice(1), [0, 0, 1600, 900]);
    assert.equal(await photo.text(), 'camera-frame');
});

test('portrait frames preserve orientation and small frames are not enlarged', async () => {
    const portrait = captureFixture({ width: 1080, height: 1920 });
    await portrait.capture();
    assert.deepEqual([portrait.canvas.width, portrait.canvas.height], [900, 1600]);
    const small = captureFixture({ width: 640, height: 480 });
    await small.capture();
    assert.deepEqual([small.canvas.width, small.canvas.height], [640, 480]);
});

test('capturing before a usable video frame is available cannot produce an empty attachment', async () => {
    await assert.rejects(captureFixture({ readyState: 1 }).capture(), /Wait for the camera preview/);
    await assert.rejects(captureFixture({ width: 0, height: 0 }).capture(), /Wait for the camera preview/);
});

test('failed encoding, unsupported canvas, and oversized snapshots are reported before attachment', async () => {
    await assert.rejects(captureFixture({ blob: null }).capture(), /could not be captured/);
    await assert.rejects(captureFixture({ blob: new Blob([]) }).capture(), /could not be captured/);
    await assert.rejects(captureFixture({ context: false }).capture(), /Upload photos/);
    await assert.rejects(captureFixture({ blob: new Blob([new Uint8Array(MAX_CONCERN_PHOTO_BYTES + 1)]) }).capture(), /too large/);
});
