/** Read a CSV or Excel file into rows of cells, for the member importer. */

/**
 * Parse RFC 4180 CSV: quoted fields may contain commas, newlines and doubled
 * quotes. Hand-rolled because a parser is ~30 lines and a dependency is not.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  // Strip the BOM Excel writes, otherwise it lands in the first header cell.
  const input = text.replace(/^﻿/, '');

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quoted) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      // \r\n counts once.
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing blank lines a spreadsheet export leaves behind.
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

/** Read a picked .csv/.xlsx file into rows of trimmed strings. */
export async function readSheet(file: File): Promise<string[][]> {
  if (/\.csv$/i.test(file.name)) {
    return parseCsv(await file.text());
  }
  // Loaded on demand — only an import ever needs the xlsx reader. `readSheet`
  // (not the default export) returns the first sheet's rows, which is all a
  // membership register ever is.
  const { readSheet: readXlsxSheet } = await import('read-excel-file/browser');
  const rows = await readXlsxSheet(file);
  return rows.map((row) =>
    row.map((cell) => (cell === null ? '' : String(cell).trim())),
  );
}

/**
 * Map a sheet's header row onto known fields, then return one object per row.
 * Headers match loosely — case, spaces, dots and underscores are ignored — so
 * "Tel. No.", "tel no" and "TEL_NO" all land on the same field.
 */
export function rowsToRecords<Field extends string>(
  rows: string[][],
  headerToField: Record<string, Field>,
): { records: Partial<Record<Field, string>>[]; unknownHeaders: string[] } {
  const [header = [], ...body] = rows;
  const lookup = new Map(
    Object.entries(headerToField).map(([label, field]) => [
      normalizeHeader(label),
      field,
    ]),
  );

  const unknownHeaders: string[] = [];
  const fields = header.map((label) => {
    const field = lookup.get(normalizeHeader(label));
    if (!field && label.trim()) unknownHeaders.push(label.trim());
    return field;
  });

  const records = body.map((row) => {
    const record: Partial<Record<Field, string>> = {};
    fields.forEach((field, index) => {
      if (!field) return;
      const value = (row[index] ?? '').trim();
      if (value) record[field] = value;
    });
    return record;
  });

  return { records, unknownHeaders };
}

function normalizeHeader(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '');
}
