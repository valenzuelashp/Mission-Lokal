import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../../resources/js/Lib/concernPhotos.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { appendConcernPhotos, MAX_CONCERN_PHOTO_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`);
const photo = (name, overrides = {}) => ({ name, type: 'image/jpeg', size: 1024, ...overrides });

test('camera captures append to uploaded photos without replacing earlier evidence', () => {
    const uploaded = photo('uploaded.jpg'), captured = photo('camera.jpg');
    assert.deepEqual(appendConcernPhotos([uploaded], [captured]), { files: [uploaded, captured], error: '' });
});

test('repeated camera filenames can still represent separate photos', () => {
    const first = photo('image.jpg'), second = photo('image.jpg');
    assert.deepEqual(appendConcernPhotos([first], [second]).files, [first, second]);
});

test('cancelling a picker preserves the current selection', () => {
    const selected = photo('selected.jpg');
    assert.deepEqual(appendConcernPhotos([selected], []), { files: [selected], error: '' });
});

test('a mixed batch cannot exceed the four-photo total', () => {
    const selected = [photo('first.jpg'), photo('second.jpg'), photo('third.jpg')];
    const fourth = photo('fourth.jpg');
    const result = appendConcernPhotos(selected, [fourth, photo('fifth.jpg')]);
    assert.deepEqual(result.files, [...selected, fourth]);
    assert.match(result.error, /up to four photos/);
});

test('existing attachments reduce the available slots when editing', () => {
    const result = appendConcernPhotos([], [photo('camera.jpg'), photo('gallery.jpg')], 1);
    assert.equal(result.files.length, 1);
    assert.ok(result.error);
    assert.equal(appendConcernPhotos([], [photo('camera.jpg')], 0).files.length, 0);
});

test('oversized, empty, and unsupported captures do not discard valid attachments', () => {
    const existing = photo('existing.jpg'), valid = photo('valid.webp', { type: 'image/webp' });
    const result = appendConcernPhotos([existing], [photo('huge.jpg', { size: MAX_CONCERN_PHOTO_BYTES + 1 }), photo('empty.jpg', { size: 0 }), photo('camera.heic', { type: 'image/heic' }), valid]);
    assert.deepEqual(result.files, [existing, valid]);
    assert.match(result.error, /4 MB/); assert.match(result.error, /empty/); assert.match(result.error, /JPG, PNG, or WebP/);
});

test('the size boundary and a supported filename without MIME metadata are accepted', () => {
    const boundary = photo('boundary.jpg', { size: MAX_CONCERN_PHOTO_BYTES }), noMime = photo('capture.PNG', { type: '' });
    assert.deepEqual(appendConcernPhotos([], [boundary, noMime]), { files: [boundary, noMime], error: '' });
    assert.ok(appendConcernPhotos([], [photo('unknown', { type: '' })]).error);
});
