'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiDownload, FiUploadCloud } from 'react-icons/fi';
import { toast } from 'sonner';
import { useImportMembers } from '@/hooks/members';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { PanelCard } from '@/components/admin/PanelCard';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { downloadCsv, downloadXlsx } from '@/shared/lib/export';
import { readSheet } from '@/shared/lib/import';
import {
  IMPORT_COLUMNS,
  toImportPreview,
  type ImportPreview,
} from '@/shared/lib/rules/member-import';
import { fadeUp, stagger } from '@/shared/lib/motion';

/** Header-only template — the columns the importer understands, in order. */
const TEMPLATE_COLUMNS = Object.keys(IMPORT_COLUMNS).map((header) => ({
  header,
  value: () => '',
}));

const PREVIEW_ROWS = 5;

export default function ImportMembersPage() {
  const router = useRouter();
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const importMembers = useImportMembers({
    onSuccess: ({ imported }) => {
      toast.success(`Imported ${imported} member${imported === 1 ? '' : 's'}`);
      router.push('/dashboard/members');
    },
    onError: (err) => toast.error(err.message),
  });

  async function pick(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    setPreview(null);
    setReadError(null);
    try {
      setPreview(toImportPreview(await readSheet(file)));
    } catch {
      setReadError(
        'Could not read that file. Save it as .csv or .xlsx and try again.',
      );
    }
  }

  const ready = preview?.members.length ?? 0;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/members" label="Back to members" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="Bulk import"
        title={
          <>
            Import <Emph>members</Emph>.
          </>
        }
        description="Upload the membership register as CSV or Excel. Column headings match the paper form — start from the template if you are unsure."
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => downloadCsv([], TEMPLATE_COLUMNS, 'members-template')}
            >
              <FiDownload size={14} aria-hidden />
              CSV template
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                downloadXlsx([], TEMPLATE_COLUMNS, 'members-template')
              }
            >
              <FiDownload size={14} aria-hidden />
              Excel template
            </Button>
          </div>
        }
      />

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-[var(--radius-cards)] border border-dashed border-border px-6 py-10 text-center transition hover:border-foreground/20">
          <FiUploadCloud size={22} className="text-muted-foreground" aria-hidden />
          <span className="text-[14px] text-foreground">
            {fileName || 'Choose a .csv or .xlsx file'}
          </span>
          <span className="text-[12px] text-muted-foreground">
            Nothing is saved until you confirm the import.
          </span>
          <input
            type="file"
            accept=".csv,.xlsx"
            className="sr-only"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>

        {readError ? (
          <div className="mt-4">
            <Alert>{readError}</Alert>
          </div>
        ) : null}
      </motion.section>

      {preview ? (
        <motion.div variants={fadeUp} className="mt-6 space-y-4">
          <PanelCard
            title={`${ready} member${ready === 1 ? '' : 's'} ready`}
            subtitle={
              preview.errors.length
                ? `${preview.errors.length} row${preview.errors.length === 1 ? '' : 's'} will be skipped`
                : 'Every row parsed cleanly'
            }
          >
            {ready > 0 ? (
              <ul className="divide-y divide-border text-[13px]">
                {preview.members.slice(0, PREVIEW_ROWS).map((m, i) => (
                  <li key={i} className="flex justify-between gap-4 py-2 first:pt-0">
                    <span className="text-foreground">
                      {m.lastName}, {m.firstName}
                    </span>
                    <span className="text-muted-foreground">
                      {m.phone ?? '—'}
                    </span>
                  </li>
                ))}
                {ready > PREVIEW_ROWS ? (
                  <li className="py-2 text-muted-foreground">
                    …and {ready - PREVIEW_ROWS} more
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                No importable rows found. Check that the first row holds the
                column headings.
              </p>
            )}

            {preview.unknownHeaders.length ? (
              <p className="mt-4 text-[12px] text-muted-foreground">
                Ignored columns: {preview.unknownHeaders.join(', ')}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                disabled={ready === 0 || importMembers.isPending}
                onClick={() => importMembers.mutate(preview.members)}
              >
                {importMembers.isPending
                  ? 'Importing…'
                  : `Import ${ready} member${ready === 1 ? '' : 's'}`}
              </Button>
            </div>
          </PanelCard>

          {preview.errors.length ? (
            <PanelCard title="Skipped rows" subtitle="Fix these and re-upload">
              <ul className="space-y-1 text-[13px] text-muted-foreground">
                {preview.errors.map((e) => (
                  <li key={e.row}>
                    <span className="text-foreground">Row {e.row}:</span>{' '}
                    {e.message}
                  </li>
                ))}
              </ul>
            </PanelCard>
          ) : null}
        </motion.div>
      ) : null}
    </motion.div>
  );
}

export const dynamic = 'force-dynamic';
