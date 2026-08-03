import assert from 'node:assert/strict';
import { test } from 'node:test';
// Explicit extension: Node's ESM resolver needs it to run this file directly.
import { parseCsv, rowsToRecords } from './import.ts';

test('parseCsv handles quotes, embedded commas and newlines', () => {
  const csv = [
    'Surname,Other Names,Address',
    'Mensah,Naana,"12 High St, Accra"',
    '"O""Brien",Kojo,"Line one\nLine two"',
  ].join('\r\n');

  assert.deepEqual(parseCsv(csv), [
    ['Surname', 'Other Names', 'Address'],
    ['Mensah', 'Naana', '12 High St, Accra'],
    ['O"Brien', 'Kojo', 'Line one\nLine two'],
  ]);
});

test('parseCsv strips the BOM and drops blank lines', () => {
  const csv = '﻿Surname,Other Names\r\nMensah,Naana\r\n,\r\n\r\n';
  assert.deepEqual(parseCsv(csv), [
    ['Surname', 'Other Names'],
    ['Mensah', 'Naana'],
  ]);
});

test('rowsToRecords matches headers loosely and flags unknown ones', () => {
  const { records, unknownHeaders } = rowsToRecords(
    [
      ['SURNAME', 'tel. no.', 'Favourite hymn'],
      ['Mensah', '+233551234567', 'Blessed Assurance'],
      ['Boateng', '', ''],
    ],
    { Surname: 'lastName', 'Tel. No.': 'phone' } as const,
  );

  assert.deepEqual(records, [
    { lastName: 'Mensah', phone: '+233551234567' },
    { lastName: 'Boateng' },
  ]);
  assert.deepEqual(unknownHeaders, ['Favourite hymn']);
});
