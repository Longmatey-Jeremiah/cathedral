'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiAtSign } from 'react-icons/fi';
import { z } from 'zod';
import { Emph } from '@/shared/components/Emph';
import { BackLink } from '@/shared/components/admin/BackLink';
import { PageHeader } from '@/shared/components/admin/PageHeader';
import { Alert } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { InputGroup } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
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
  const [sent, setSent] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', role: UserRole.VIEWER },
  });

  const onSubmit = form.handleSubmit((values) => {
    // TODO(api): POST /users/invite — server hashes a token, mails it.
    setSent(values.email);
    form.reset({ email: '', role: UserRole.VIEWER });
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

      {sent ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="success">
            Invite sent to <span className="font-medium">{sent}</span>.
          </Alert>
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
              <Button type="submit">Send invite</Button>
            </div>
          </form>
        </Form>
      </motion.section>
    </motion.div>
  );
}
