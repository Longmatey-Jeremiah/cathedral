import assert from 'node:assert/strict';
import { test } from 'node:test';
// Explicit extension: Node's ESM resolver needs it to run this file directly.
import { readGoogleCallback } from './google-callback.ts';

// The fragment is user-editable, so this parser is a trust boundary: a junk or
// half-shaped payload must never reach `signIn`.

const encode = (payload: unknown) =>
  '#' + Buffer.from(JSON.stringify(payload)).toString('base64url');

const session = {
  accessToken: 'a',
  refreshToken: 'r',
  mustChangePassword: false,
  user: { id: 'u1', email: 'a@b.c', role: 'ADMIN', churchId: null },
};

test('reads a valid session payload', () => {
  const result = readGoogleCallback(encode({ session }));
  assert.equal(result.session?.accessToken, 'a');
  assert.equal(result.error, undefined);
});

test('passes through an error payload', () => {
  assert.equal(readGoogleCallback(encode({ error: 'no_account' })).error, 'no_account');
});

test('rejects junk, empty, and half-shaped fragments', () => {
  for (const hash of ['', '#', '#not-base64!!', encode({ session: { accessToken: 'a' } })]) {
    const result = readGoogleCallback(hash);
    assert.equal(result.session, undefined, `accepted: ${hash}`);
    assert.ok(result.error);
  }
});
