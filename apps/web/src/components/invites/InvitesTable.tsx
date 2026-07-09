'use client';

import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { FiCheck, FiCopy, FiEye, FiRefreshCw } from 'react-icons/fi';
import { RoleBadge } from '@/components/members/RoleBadge';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSendInvite } from '@/hooks/invites';
import { inviteStatus, type Invite } from '@/types/invites';

const toneByStatus = {
  pending: 'warning',
  used: 'success',
  expired: 'danger',
} as const;

const labelByStatus = {
  pending: 'Pending',
  used: 'Accepted',
  expired: 'Expired',
} as const;

export function InvitesTable({ invites }: { invites: Invite[] }) {
  const [viewing, setViewing] = useState<Invite | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const send = useSendInvite({
    onSuccess: (result) => toast.success(`Invite re-sent to ${result.email}`),
    onError: (err) => toast.error(err.message),
    onSettled: () => setResendingId(null),
  });

  const resend = (i: Invite) => {
    setResendingId(i.id);
    // Re-issuing supersedes the old token server-side, so a fresh link goes out.
    send.mutate({ email: i.email, role: i.role, churchId: i.churchId ?? undefined });
  };

  const columns: Column<Invite>[] = [
    {
      key: 'email',
      header: 'Email',
      cell: (i) => (
        <span className="font-medium text-foreground">{i.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (i) => <RoleBadge role={i.role} />,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (i) => {
        const s = inviteStatus(i);
        return (
          <StatusBadge tone={toneByStatus[s]} dot>
            {labelByStatus[s]}
          </StatusBadge>
        );
      },
    },
    {
      key: 'expires',
      header: 'Expires',
      className: 'hidden md:table-cell',
      cell: (i) => formatDate(i.expiresAt),
    },
    {
      key: 'created',
      header: 'Sent',
      className: 'hidden lg:table-cell text-[12px] text-muted-foreground',
      cell: (i) => formatDate(i.createdAt),
    },
    {
      key: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (i) => (
        <div className="flex justify-end gap-1">
          <IconAction
            label="View invite"
            onClick={() => setViewing(i)}
          >
            <FiEye size={14} aria-hidden />
          </IconAction>
          {/* Only expired invites need re-issuing; pending links are still live. */}
          {inviteStatus(i) === 'expired' && (
            <IconAction
              label="Resend invite"
              disabled={send.isPending}
              onClick={() => resend(i)}
            >
              <FiRefreshCw
                size={14}
                aria-hidden
                className={resendingId === i.id ? 'animate-spin' : undefined}
              />
            </IconAction>
          )}
        </div>
      ),
    },
  ];

  return (
    <TooltipProvider delayDuration={300}>
      <DataTable data={invites} columns={columns} rowKey={(i) => i.id} />
      <ViewInviteDialog invite={viewing} onClose={() => setViewing(null)} />
    </TooltipProvider>
  );
}

/** Round icon button used in the actions column, matching the other admin tables. */
function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          className="inline-grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function ViewInviteDialog({
  invite,
  onClose,
}: {
  invite: Invite | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!invite?.inviteUrl) return;
    await navigator.clipboard.writeText(invite.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={Boolean(invite)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite details</DialogTitle>
          <DialogDescription>{invite?.email}</DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-[13px]">
          <dt className="text-muted-foreground">Role</dt>
          <dd className="text-foreground">{invite?.role}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-foreground">
            {invite ? labelByStatus[inviteStatus(invite)] : ''}
          </dd>
          <dt className="text-muted-foreground">Sent</dt>
          <dd className="text-foreground">
            {invite ? formatDate(invite.createdAt) : ''}
          </dd>
          <dt className="text-muted-foreground">Expires</dt>
          <dd className="text-foreground">
            {invite ? formatDate(invite.expiresAt) : ''}
          </dd>
        </dl>

        <div>
          <p className="mb-1 text-[13px] text-muted-foreground">Invite link</p>
          {invite?.inviteUrl ? (
            <div className="flex items-center gap-2 rounded-[var(--radius-cards)] border border-border bg-muted/40 p-2">
              <span className="flex-1 truncate px-1 text-[13px] text-muted-foreground">
                {invite.inviteUrl}
              </span>
              <Button type="button" variant="outline" size="sm" onClick={copy}>
                {copied ? (
                  <FiCheck size={14} aria-hidden />
                ) : (
                  <FiCopy size={14} aria-hidden />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              No link available — resend to generate a new one.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}
