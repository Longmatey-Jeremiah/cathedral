import assert from 'node:assert/strict';
import { test } from 'node:test';
// Explicit extension: Node's ESM resolver needs it to run this file directly.
import { formatMinor, toMinor } from './money.ts';

// The money parser is the one place a rounding slip turns into a wrong ledger,
// so it keeps a check. Run with `npm test -w @cmp/web` (Node >= 22).

test('parses whole and decimal amounts into minor units', () => {
  assert.equal(toMinor('1250'), 125_000);
  assert.equal(toMinor('1250.50'), 125_050);
  assert.equal(toMinor('0.05'), 5);
});

test('survives the binary float trap', () => {
  // 12.34 * 100 is 1233.9999999999998 before rounding.
  assert.equal(toMinor('12.34'), 1234);
  assert.equal(toMinor('8.87'), 887);
});

test('accepts thousands separators and spaces', () => {
  assert.equal(toMinor('1,250.50'), 125_050);
  assert.equal(toMinor(' 1 250 '), 125_000);
});

test('rejects anything that is not a plain positive amount', () => {
  for (const bad of ['', 'abc', '-5', '1.234', '1.2.3', '1e3', '.5']) {
    assert.equal(toMinor(bad), null, `expected ${JSON.stringify(bad)} to fail`);
  }
});

test('formats minor units back to a major-unit currency string', () => {
  assert.match(formatMinor(125_000, 'NGN'), /1,250/); // kobo -> naira
  assert.match(formatMinor(-125_000, 'NGN'), /1,250/); // reversals render too
});

test('round-trips through parse and format without losing the kobo', () => {
  assert.match(formatMinor(toMinor('1,250.50') as number, 'NGN'), /1,250\.50/);
});
