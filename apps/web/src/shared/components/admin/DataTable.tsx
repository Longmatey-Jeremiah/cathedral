'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '../../lib/motion';
import { cn } from '../../lib/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

export interface Column<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Tailwind classes applied to both the header cell and the body cell. */
  className?: string;
  /** Right-align the column content. */
  align?: 'left' | 'right';
}

interface Props<Row> {
  data: Row[];
  columns: Column<Row>[];
  /** Stable key extractor for each row. */
  rowKey: (row: Row) => string;
  className?: string;
}

/**
 * Admin table with snow surface, hairline row dividers, and a hover state.
 * Columns are described declaratively so concrete tables stay short.
 */
export function DataTable<Row>({
  data,
  columns,
  rowKey,
  className,
}: Props<Row>) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        'overflow-hidden rounded-[var(--radius-cards)] border border-border bg-card shadow-card',
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  col.align === 'right' && 'text-right',
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  className={cn(
                    col.align === 'right' && 'text-right',
                    col.className,
                  )}
                >
                  {col.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
