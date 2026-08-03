import assert from 'node:assert/strict';
import { test } from 'node:test';
// Explicit extension: Node's ESM resolver needs it to run this file directly.
import {
  exportDate,
  fetchAllPages,
  toCsv,
  type ExportColumn,
} from './export.ts';

interface Row {
  name: string;
  amount: number;
  note: string | null;
}

const columns: ExportColumn<Row>[] = [
  { header: 'Name', value: (r) => r.name },
  { header: 'Amount', value: (r) => r.amount },
  { header: 'Note', value: (r) => r.note },
];

test('toCsv quotes commas, quotes and newlines; blanks nulls', () => {
  const csv = toCsv(
    [
      { name: 'Mensah, Ama', amount: 12.5, note: null },
      { name: 'He said "yes"', amount: 0, note: 'line\nbreak' },
    ],
    columns,
  );

  assert.equal(
    csv,
    [
      'Name,Amount,Note',
      '"Mensah, Ama",12.5,',
      '"He said ""yes""",0,"line\nbreak"',
    ].join('\r\n'),
  );
});

test('exportDate trims timestamps and tolerates null', () => {
  assert.equal(exportDate('2026-08-02T09:30:00.000Z'), '2026-08-02');
  assert.equal(exportDate(null), '');
});

test('fetchAllPages walks every page', async () => {
  const all = Array.from({ length: 250 }, (_, i) => i);
  const seen: number[] = [];

  const rows = await fetchAllPages<number>(async (page, pageSize) => {
    seen.push(page);
    return {
      data: all.slice((page - 1) * pageSize, page * pageSize),
      total: all.length,
    };
  });

  assert.deepEqual(seen, [1, 2, 3]);
  assert.equal(rows.length, 250);
  assert.equal(rows[249], 249);
});

test('fetchAllPages stops when a page comes back empty', async () => {
  const rows = await fetchAllPages<number>(async (page) => ({
    data: page === 1 ? [1, 2, 3] : [],
    total: 10_000,
  }));

  assert.deepEqual(rows, [1, 2, 3]);
});
