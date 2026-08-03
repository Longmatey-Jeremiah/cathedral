'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCalendar } from 'react-icons/fi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateCareNote } from '@/hooks/care';
import { useMembers } from '@/hooks/members';
import { ApiError } from '@/services/api';
import {
  createCareNoteSchema,
  type CreateCareNoteFormInput,
} from '@/shared/lib/rules/care';
import { Emph } from '@/components/Emph';
import { BackLink } from '@/components/admin/BackLink';
import { PageHeader } from '@/components/admin/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input, InputGroup, inlineInput } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { careTypeLabel, CareType } from '@/types/care';

export default function NewCareNotePage() {
  const [created, setCreated] = useState(false);

  // A church can have thousands of members; the picker loads the first page and
  // narrows by search rather than fetching everyone.
  const [memberQuery, setMemberQuery] = useState('');
  const [debouncedMemberQuery, setDebouncedMemberQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMemberQuery(memberQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [memberQuery]);
  const members = useMembers({ pageSize: 50, q: debouncedMemberQuery });

  const form = useForm<CreateCareNoteFormInput>({
    resolver: zodResolver(createCareNoteSchema),
    defaultValues: {
      memberId: '',
      type: CareType.VISIT,
      body: '',
      confidential: false,
      followUpAt: '',
    },
  });

  // Counselling defaults to confidential, matching the API. Flipping the type
  // moves the checkbox with it until the user overrides it by hand.
  const type = form.watch('type');
  useEffect(() => {
    if (!form.formState.dirtyFields.confidential) {
      form.setValue('confidential', type === CareType.COUNSEL);
    }
  }, [type, form]);

  const create = useCreateCareNote({
    onSuccess: () => {
      setCreated(true);
      form.reset();
      setMemberQuery('');
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    create.mutate({
      memberId: values.memberId,
      type: values.type,
      body: values.body,
      confidential: values.confidential,
      // Date input gives 'YYYY-MM-DD'; send an ISO instant the API can parse.
      ...(values.followUpAt
        ? { followUpAt: new Date(values.followUpAt).toISOString() }
        : {}),
    });
  });

  const formError = formErrorMessage(create.error);

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/care" label="Back to care" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New care note"
        title={
          <>
            Log <Emph>care</Emph>.
          </>
        }
        description="Record a visit, call, prayer request or counselling session. Set a follow-up date and this member stays on the queue until someone closes it."
      />

      {created ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="success">Care note logged.</Alert>
        </motion.div>
      ) : null}

      {formError ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert>{formError}</Alert>
        </motion.div>
      ) : null}

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Member</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a member" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <Input
                            type="search"
                            value={memberQuery}
                            onChange={(e) => setMemberQuery(e.target.value)}
                            placeholder="Search members…"
                            aria-label="Search members"
                            className="h-9 text-[13px]"
                            // Keep keystrokes in the box instead of the Select's
                            // type-ahead stealing focus back to the list.
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {members.isLoading ? (
                          <div className="px-3 py-2 text-[13px] text-muted-foreground">
                            Loading…
                          </div>
                        ) : (members.data?.data.length ?? 0) === 0 ? (
                          <div className="px-3 py-2 text-[13px] text-muted-foreground">
                            No member found
                          </div>
                        ) : (
                          members.data?.data.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(CareType).map((t) => (
                          <SelectItem key={t} value={t}>
                            {careTypeLabel[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>What happened</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={6}
                      placeholder="Visited at home after the hospital discharge. Family are coping; needs meals for two weeks."
                      invalid={Boolean(fieldState.error)}
                      className="min-h-[140px] text-[15px] leading-[1.6]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpAt"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Follow up on (optional)</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiCalendar size={16} aria-hidden />}
                    >
                      {/* Native date input — no picker dependency needed. */}
                      <Input type="date" className={inlineInput} {...field} />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confidential"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-start justify-between gap-4 rounded-[var(--radius-cardinner)] border border-border p-3">
                      <span className="text-[13px] leading-[1.5]">
                        <span className="font-medium text-foreground">
                          Confidential
                        </span>
                        <span className="block text-muted-foreground">
                          Only you and church admins will be able to read this
                          note. Counselling is marked confidential by default.
                        </span>
                      </span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-label="Confidential"
                        className="mt-0.5 shrink-0"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Log care note'}
              </Button>
            </div>
          </form>
        </Form>
      </motion.section>
    </motion.div>
  );
}

function formErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return 'Could not reach the server. Please try again in a moment.';
    }
    if (error.isValidation) return null;
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
