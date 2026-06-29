'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiPhone, FiUser } from 'react-icons/fi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateMember } from '@/hooks/members';
import { ApiError } from '@/services/api';
import {
  createMemberSchema,
  type CreateMemberFormInput,
} from '@/shared/lib/rules/members';
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
import { InputGroup } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { fadeUp, stagger } from '@/shared/lib/motion';

const inlineInput =
  'h-11 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0';

export default function NewMemberPage() {
  const [created, setCreated] = useState(false);

  const form = useForm<CreateMemberFormInput>({
    resolver: zodResolver(createMemberSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      status: 'VISITOR',
    },
  });

  // POST /members — a church/domain record, separate from any auth account.
  const create = useCreateMember({
    onSuccess: () => {
      setCreated(true);
      form.reset();
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    create.mutate(values);
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
        <BackLink href="/dashboard/members" label="Back to members" />
      </motion.div>

      <PageHeader
        className="mt-3"
        eyebrow="New member"
        title={
          <>
            Add a <Emph>member</Emph>.
          </>
        }
        description="Creates a church member record. Members are people in your church — separate from sign-in accounts. Assign departments and update status any time."
      />

      {created ? (
        <motion.div variants={fadeUp} className="mt-6">
          <Alert tone="success">Member added to the directory.</Alert>
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
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <InputGroup
                        invalid={Boolean(fieldState.error)}
                        startAdornment={<FiUser size={16} aria-hidden />}
                      >
                        <input
                          placeholder="Naana"
                          className={inlineInput}
                          {...field}
                        />
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <InputGroup invalid={Boolean(fieldState.error)}>
                        <input
                          placeholder="Mensah"
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
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiPhone size={16} aria-hidden />}
                    >
                      <input
                        type="tel"
                        placeholder="+233 55 123 4567"
                        className={inlineInput}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                        <SelectItem value="VISITOR">Visitor</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Adding…' : 'Add member'}
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
