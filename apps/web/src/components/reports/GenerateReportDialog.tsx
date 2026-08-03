'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import type { Report } from '@/mocks/reports';
import { streamChat } from '@/services/ai.service';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Streams a first draft of a report from its spec.
 *
 * ponytail: the prompt carries the report's title and description only — no
 * live attendance or giving figures, so the model is told to leave marked
 * placeholders. Feed it real numbers once the summary endpoints are wired.
 */
function promptFor(report: Report): string {
  return [
    `Draft the "${report.title}" report for a church leadership team.`,
    `Its purpose: ${report.description}`,
    `Cadence: ${report.cadence}.`,
    '',
    'Write the narrative structure a good version of this report would have:',
    'a short summary, the sections it needs, and what each section should say.',
    'Where a real figure belongs, leave a placeholder in square brackets naming',
    'the number and the module it comes from — never invent data.',
    'Keep it under 400 words.',
  ].join('\n');
}

export function GenerateReportDialog({
  report,
  onClose,
}: {
  report: Report | null;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (target: Report) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setDraft('');
    setError(null);
    setStreaming(true);
    try {
      await streamChat(
        [{ role: 'user', content: promptFor(target) }],
        (chunk) => setDraft((current) => current + chunk),
        controller.signal,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not draft the report.');
    } finally {
      setStreaming(false);
    }
  }, []);

  // One run per opened report; closing aborts whatever is in flight.
  useEffect(() => {
    if (!report) {
      abortRef.current?.abort();
      return;
    }
    void generate(report);
    return () => abortRef.current?.abort();
  }, [report, generate]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success('Draft copied');
    } catch {
      toast.error('Could not copy the draft');
    }
  }

  return (
    <Dialog open={Boolean(report)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{report?.title}</DialogTitle>
          <DialogDescription>
            An AI first draft. Figures in brackets still need pulling from the
            relevant module.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto rounded-[10px] border border-border bg-muted/40 px-4 py-3 text-[14px] leading-[1.6] text-carbon">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : (
            <p className="whitespace-pre-wrap">
              {draft || <span className="text-stone">Drafting…</span>}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <p aria-live="polite" className="text-[12px] text-stone">
            {streaming ? 'Writing…' : draft ? 'Draft ready' : ''}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => report && void generate(report)}
              disabled={streaming}
            >
              <FiRefreshCw size={14} aria-hidden />
              Regenerate
            </Button>
            <Button size="sm" onClick={() => void copy()} disabled={!draft || streaming}>
              <FiCopy size={14} aria-hidden />
              Copy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
