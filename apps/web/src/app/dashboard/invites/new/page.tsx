'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiAtSign, FiCheck, FiCopy } from 'react-icons/fi';
import { z } from 'zod';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputGroup } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSendInvite } from '@/hooks/invites';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { UserRole } from '@/shared/lib/types';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  role: z.enum(['ADMIN', 'FINANCE', 'DEPARTMENT_LEADER', 'VIEWER']),
});
type Values = z.infer<typeof schema>;

const inlineInput =
  'h-11 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0';

export default function NewInvitePage() {
  const router = useRouter();
  const [sent, setSent] = useState<{ email: string; inviteUrl: string } | null>(
    null,
  );

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: UserRole.VIEWER },
  });

  const send = useSendInvite({
    onSuccess: (result) => {
      setSent({ email: result.email, inviteUrl: result.inviteUrl });
      form.reset({ email: '', role: UserRole.VIEWER });
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    setSent(null);
    send.mutate(values);
  });

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/invites" label="Back to invites" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New invite"
        title={
          <>
            Invite a <Emph>teammate</Emph>.
          </>
        }
        description="They will receive a single-use link tied to the role you choose. The link expires in 72 hours."
      />

      <InviteSentDialog
        sent={sent}
        onInviteAnother={() => setSent(null)}
        onFinish={() => router.push('/dashboard/invites')}
      />

      {send.error ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="error">{send.error.message}</Alert>
        </motion.div>
      ) : null}

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <Form {...form}>
          <form
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-5"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiAtSign size={16} aria-hidden />}
                    >
                      <input
                        type="email"
                        autoFocus
                        placeholder="them@church.org"
                        className={inlineInput}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    They will get a one-time link bound to this address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="FINANCE">Finance</SelectItem>
                        <SelectItem value="DEPARTMENT_LEADER">
                          Department leader
                        </SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Roles can be changed later from the member detail page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={send.isPending}>
                {send.isPending ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </form>
        </Form>
      </motion.section>
    </motion.div>
  );
}

function InviteSentDialog({
  sent,
  onInviteAnother,
  onFinish,
}: {
  sent: { email: string; inviteUrl: string } | null;
  onInviteAnother: () => void;
  onFinish: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!sent) return;
    await navigator.clipboard.writeText(sent.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={Boolean(sent)} onOpenChange={(open) => !open && onFinish()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite sent</DialogTitle>
          <DialogDescription>
            A single-use link is on its way to{' '}
            <span className="font-medium text-foreground">{sent?.email}</span>.
            You can also copy it and share directly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-[var(--radius-cards)] border border-border bg-muted/40 p-2">
          <span className="flex-1 truncate px-1 text-[13px] text-muted-foreground">
            {sent?.inviteUrl}
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onInviteAnother}>
            Invite another
          </Button>
          <Button type="button" onClick={onFinish}>
            Finish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
