import assert from 'node:assert/strict';
import { test } from 'node:test';
// Explicit extension: Node's ESM resolver needs it to run this file directly.
import { toImportPreview } from './member-import.ts';

const HEADER = [
  'Surname',
  'Other Names',
  'Sex',
  'Date of Birth',
  'Marital Status',
  'Name of Children',
  'Status',
];

test('maps a good row onto an API payload', () => {
  const { members, errors } = toImportPreview([
    HEADER,
    ['Mensah', 'Naana Efua', 'female', '04/07/1990', 'Married', 'Ama; Kojo', 'Active'],
  ]);

  assert.deepEqual(errors, []);
  assert.equal(members.length, 1);
  assert.partialDeepStrictEqual(members[0], {
    lastName: 'Mensah',
    firstName: 'Naana Efua',
    sex: 'FEMALE',
    dateOfBirth: '1990-07-04T00:00:00.000Z',
    maritalStatus: 'MARRIED',
    childrenNames: ['Ama', 'Kojo'],
    status: 'ACTIVE',
  });
});

test('defaults status to VISITOR and leaves blanks out', () => {
  const { members } = toImportPreview([HEADER, ['Boateng', 'Ama', '', '', '', '', '']]);
  assert.equal(members[0].status, 'VISITOR');
  assert.equal(members[0].sex, undefined);
  assert.equal(members[0].dateOfBirth, undefined);
});

test('reports the row number for missing names and bad values', () => {
  const { members, errors } = toImportPreview([
    HEADER,
    ['', 'Kwame', '', '', '', '', ''],
    ['Owusu', 'Kojo', 'unsure', '', '', '', ''],
    ['Darko', 'Efua', '', 'last Tuesday', '', '', ''],
  ]);

  assert.equal(members.length, 0);
  assert.deepEqual(
    errors.map((e) => e.row),
    [2, 3, 4],
  );
  assert.match(errors[0].message, /required/);
  assert.match(errors[1].message, /Male or Female/);
  assert.match(errors[2].message, /not a date/);
});

test('flags columns it does not know', () => {
  const { unknownHeaders } = toImportPreview([
    ['Surname', 'Other Names', 'Shoe size'],
    ['Mensah', 'Naana', '42'],
  ]);
  assert.deepEqual(unknownHeaders, ['Shoe size']);
});
