'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiCalendar, FiHash } from 'react-icons/fi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateFund, useFunds, useRecordDonation } from '@/hooks/giving';
import { useMembers } from '@/hooks/members';
import { ApiError } from '@/services/api';
import {
  recordDonationSchema,
  type RecordDonationFormInput,
} from '@/shared/lib/rules/giving';
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
import { toMinor } from '@/shared/lib/money';
import { fadeUp, stagger } from '@/shared/lib/motion';
import { GivingMethod, methodLabel } from '@/types/giving';

const today = () => new Date().toISOString().slice(0, 10);

export default function RecordGivingPage() {
  const [created, setCreated] = useState(false);

  const funds = useFunds();
  const [memberQuery, setMemberQuery] = useState('');
  const [debouncedMemberQuery, setDebouncedMemberQuery] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMemberQuery(memberQuery.trim()), 300);
    return () => clearTimeout(id);
  }, [memberQuery]);
  const members = useMembers({ pageSize: 50, q: debouncedMemberQuery });

  const form = useForm<RecordDonationFormInput>({
    resolver: zodResolver(recordDonationSchema),
    defaultValues: {
      fundId: '',
      memberId: '',
      amount: '',
      method: GivingMethod.CASH,
      reference: '',
      givenAt: today(),
    },
  });

  const record = useRecordDonation({
    onSuccess: () => {
      setCreated(true);
      form.reset({
        fundId: form.getValues('fundId'), // counting one fund at a time is normal
        memberId: '',
        amount: '',
        method: form.getValues('method'),
        reference: '',
        givenAt: form.getValues('givenAt'),
      });
      setMemberQuery('');
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    const amountMinor = toMinor(values.amount);
    if (amountMinor === null) return; // schema already blocked this
    record.mutate({
      fundId: values.fundId,
      amountMinor,
      method: values.method,
      givenAt: new Date(values.givenAt).toISOString(),
      ...(values.memberId ? { memberId: values.memberId } : {}),
      ...(values.reference ? { reference: values.reference } : {}),
    });
  });

  const formError = formErrorMessage(record.error);
  const hasFunds = (funds.data?.length ?? 0) > 0;

  return (
    <motion.div
      variants={stagger(0.05, 0.05)}
      initial="hidden"
      animate="show"
      className="mx-auto w-full max-w-[760px]"
    >
      <motion.div variants={fadeUp}>
        <BackLink href="/dashboard/giving" label="Back to giving" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New entry"
        title={
          <>
            Record <Emph>giving</Emph>.
          </>
        }
        description="Posts one entry to the ledger. Leave the member blank for anonymous giving. Entries cannot be edited afterwards — a mistake is corrected with a reversal."
      />

      {created ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="success">
            Entry posted. The form is ready for the next one.
          </Alert>
        </motion.div>
      ) : null}

      {formError ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert>{formError}</Alert>
        </motion.div>
      ) : null}

      {funds.isSuccess && !hasFunds ? (
        <motion.div variants={fadeUp} className="mt-6">
          <FirstFundPrompt />
        </motion.div>
      ) : null}

      <motion.section
        variants={fadeUp}
        className="mt-8 rounded-[var(--radius-cards)] border border-border bg-card p-6 shadow-card sm:p-8"
      >
        <Form {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fundId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fund</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!hasFunds}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              hasFunds ? 'Choose a fund' : 'No funds yet'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {funds.data?.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.name}
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
                name="amount"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <InputGroup invalid={Boolean(fieldState.error)}>
                        {/* Text, not number: the field must accept "1,250.50"
                            and be converted to minor units on submit. */}
                        <Input
                          inputMode="decimal"
                          placeholder="1250.00"
                          className={inlineInput}
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giver (optional)</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Anonymous" />
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

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Method</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(GivingMethod).map((m) => (
                            <SelectItem key={m} value={m}>
                              {methodLabel[m]}
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
                name="givenAt"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Date given</FormLabel>
                    <FormControl>
                      <InputGroup
                        invalid={Boolean(fieldState.error)}
                        startAdornment={<FiCalendar size={16} aria-hidden />}
                      >
                        <Input type="date" className={inlineInput} {...field} />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Reference (optional)</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiHash size={16} aria-hidden />}
                    >
                      <Input
                        placeholder="Teller or cheque number"
                        className={inlineInput}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={record.isPending || !hasFunds}
              >
                {record.isPending ? 'Posting…' : 'Post entry'}
              </Button>
            </div>
          </form>
        </Form>
      </motion.section>
    </motion.div>
  );
}

/**
 * Giving cannot be recorded without a fund, so the first-run case gets an
 * inline creator rather than a separate funds admin screen.
 */
function FirstFundPrompt() {
  const [name, setName] = useState('Tithe');
  const create = useCreateFund();

  return (
    <div className="rounded-[var(--radius-cards)] border border-dashed border-border p-5">
      <div className="text-[14px] font-medium text-foreground">
        Create your first fund
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        Every entry is designated to a fund — Tithe, Building, Missions. Add one
        to start recording.
      </p>
      {create.error ? (
        <div className="mt-3">
          <Alert>{create.error.message}</Alert>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Fund name"
          placeholder="Tithe"
          className="flex-1"
        />
        <Button
          type="button"
          disabled={create.isPending || name.trim().length === 0}
          onClick={() => create.mutate({ name: name.trim() })}
        >
          {create.isPending ? 'Creating…' : 'Create fund'}
        </Button>
      </div>
    </div>
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
