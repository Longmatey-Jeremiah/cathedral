import type { CreateMemberInput } from '@/services/members.service';
// Relative + extension so `node --test` can run the check without a bundler.
import { rowsToRecords } from '../import.ts';

/**
 * Spreadsheet column → member field. The labels are the ones on the paper
 * membership form; header matching ignores case, spaces and punctuation.
 */
export const IMPORT_COLUMNS = {
  Surname: 'lastName',
  'Other Names': 'firstName',
  Sex: 'sex',
  'Date of Birth': 'dateOfBirth',
  'Place of Birth': 'placeOfBirth',
  Address: 'address',
  'Place of Residence': 'placeOfResidence',
  Occupation: 'occupation',
  'Place of Work': 'placeOfWork',
  Society: 'society',
  'Tel. No.': 'phone',
  'Next of Kin': 'nextOfKin',
  'Name of Parents': 'parentsName',
  Hometown: 'hometown',
  'Marital Status': 'maritalStatus',
  'Name of Spouse': 'spouseName',
  'Spouse Occupation': 'spouseOccupation',
  'Religious Denomination': 'religiousDenomination',
  'Name of Children': 'childrenNames',
  'Declaration Date': 'declarationDate',
  Status: 'status',
} as const;

type Field = (typeof IMPORT_COLUMNS)[keyof typeof IMPORT_COLUMNS];
type Record_ = Partial<Record<Field, string>>;

export interface ImportRowError {
  /** 1-based row number as the user sees it in the sheet (header is row 1). */
  row: number;
  message: string;
}

export interface ImportPreview {
  members: CreateMemberInput[];
  errors: ImportRowError[];
  unknownHeaders: string[];
}

const SEX = { male: 'MALE', m: 'MALE', female: 'FEMALE', f: 'FEMALE' } as const;

const MARITAL = {
  single: 'SINGLE',
  married: 'MARRIED',
  widowed: 'WIDOWED',
  widow: 'WIDOWED',
  divorced: 'DIVORCED',
} as const;

const STATUS = {
  active: 'ACTIVE',
  inactive: 'INACTIVE',
  visitor: 'VISITOR',
} as const;

function key(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

/** yyyy-mm-dd, dd/mm/yyyy and what Excel hands back all become an ISO string. */
function toIsoDate(value: string): string | null {
  const slashed = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  const iso = slashed
    ? `${slashed[3]}-${slashed[2].padStart(2, '0')}-${slashed[1].padStart(2, '0')}`
    : value;
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00.000Z` : iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Turn parsed sheet rows into API payloads, collecting per-row problems. */
export function toImportPreview(rows: string[][]): ImportPreview {
  const { records, unknownHeaders } = rowsToRecords<Field>(rows, IMPORT_COLUMNS);
  const members: CreateMemberInput[] = [];
  const errors: ImportRowError[] = [];

  records.forEach((record: Record_, index) => {
    const row = index + 2; // +1 for the header, +1 for 1-based numbering
    const fail = (message: string) => errors.push({ row, message });

    if (!record.lastName || !record.firstName) {
      fail('Surname and Other Names are both required');
      return;
    }

    const member: CreateMemberInput = {
      lastName: record.lastName,
      firstName: record.firstName,
      phone: record.phone,
      placeOfBirth: record.placeOfBirth,
      address: record.address,
      placeOfResidence: record.placeOfResidence,
      occupation: record.occupation,
      placeOfWork: record.placeOfWork,
      society: record.society,
      nextOfKin: record.nextOfKin,
      parentsName: record.parentsName,
      hometown: record.hometown,
      spouseName: record.spouseName,
      spouseOccupation: record.spouseOccupation,
      religiousDenomination: record.religiousDenomination,
      status: 'VISITOR',
    };

    if (record.sex) {
      const sex = SEX[key(record.sex) as keyof typeof SEX];
      if (!sex) return fail(`Sex "${record.sex}" is not Male or Female`);
      member.sex = sex;
    }

    if (record.maritalStatus) {
      const marital = MARITAL[key(record.maritalStatus) as keyof typeof MARITAL];
      if (!marital) return fail(`Marital status "${record.maritalStatus}" is not recognised`);
      member.maritalStatus = marital;
    }

    if (record.status) {
      const status = STATUS[key(record.status) as keyof typeof STATUS];
      if (!status) return fail(`Status "${record.status}" is not recognised`);
      member.status = status;
    }

    for (const field of ['dateOfBirth', 'declarationDate'] as const) {
      const raw = record[field];
      if (!raw) continue;
      const isoDate = toIsoDate(raw);
      if (!isoDate) return fail(`"${raw}" is not a date the importer understands`);
      member[field] = isoDate;
    }

    if (record.childrenNames) {
      member.childrenNames = record.childrenNames
        .split(/[\n,;]/)
        .map((name) => name.trim())
        .filter(Boolean);
    }

    members.push(member);
  });

  return { members, errors, unknownHeaders };
}
