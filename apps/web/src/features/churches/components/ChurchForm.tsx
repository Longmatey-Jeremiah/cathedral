'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiAtSign,
  FiHash,
  FiHome,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi';
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
import { Switch } from '@/shared/components/ui/switch';
import { ApiError } from '@/shared/lib/api';
import { fadeUp, stagger } from '@/shared/lib/motion';
import {
  createChurchSchema,
  suggestSlug,
  type CreateChurchInput,
} from '../schemas';

export type ChurchFormValues = CreateChurchInput;

interface Props {
  defaultValues?: Partial<ChurchFormValues>;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: ChurchFormValues) => void | Promise<unknown>;
  isPending?: boolean;
  serverError?: ApiError | null;
  /** Auto-derive slug from name as the user types (only when slug hasn't been manually edited). */
  autoSlug?: boolean;
}

const defaultBlank: ChurchFormValues = {
  name: '',
  slug: '',
  address: '',
  phone: '',
  email: '',
  isActive: true,
};

const inlineInput =
  'h-11 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0';

export function ChurchForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  isPending = false,
  serverError = null,
  autoSlug = true,
}: Props) {
  const slugTouched = useRef(false);

  const form = useForm<ChurchFormValues>({
    resolver: zodResolver(createChurchSchema),
    mode: 'onSubmit',
    defaultValues: { ...defaultBlank, ...defaultValues },
  });

  useEffect(() => {
    if (defaultValues?.slug) slugTouched.current = true;
  }, [defaultValues?.slug]);

  const nameValue = form.watch('name');
  useEffect(() => {
    if (!autoSlug || slugTouched.current) return;
    form.setValue('slug', suggestSlug(nameValue ?? ''), {
      shouldValidate: false,
    });
  }, [nameValue, autoSlug, form]);

  const submit = form.handleSubmit((values) => onSubmit(values));
  const formError = formErrorMessage(serverError);
  const busy = isPending || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <motion.form
        noValidate
        onSubmit={submit}
        variants={stagger(0.05, 0.05)}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5"
        aria-busy={busy || undefined}
      >
        {formError ? (
          <motion.div variants={fadeUp}>
            <Alert>{formError}</Alert>
          </motion.div>
        ) : null}

        <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiHome size={16} aria-hidden />}
                  >
                    <input
                      placeholder="Grace Central Cathedral"
                      autoFocus
                      disabled={busy}
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
            name="slug"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiHash size={16} aria-hidden />}
                  >
                    <input
                      placeholder="grace-central"
                      disabled={busy}
                      className={inlineInput}
                      {...field}
                      onChange={(e) => {
                        slugTouched.current = true;
                        field.onChange(e);
                      }}
                    />
                  </InputGroup>
                </FormControl>
                <FormDescription>
                  Used in URLs and integrations. Lowercase letters, numbers,
                  hyphens.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <FormField
            control={form.control}
            name="address"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiMapPin size={16} aria-hidden />}
                  >
                    <input
                      placeholder="123 Main St, Accra"
                      disabled={busy}
                      className={inlineInput}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-5 sm:grid-cols-2">
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
                      placeholder="+233 24 000 0000"
                      disabled={busy}
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
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Contact email</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiAtSign size={16} aria-hidden />}
                  >
                    <input
                      type="email"
                      placeholder="hello@church.org"
                      disabled={busy}
                      className={inlineInput}
                      {...field}
                    />
                  </InputGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex-row items-center justify-between gap-4 rounded-[var(--radius-cardinner)] border border-border bg-card px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <FormLabel className="text-[14px] font-medium normal-case tracking-normal text-foreground">
                    Active
                  </FormLabel>
                  <FormDescription>
                    Inactive churches stay in the list but staff cannot sign in.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={busy}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-end gap-3 pt-2">
          <Button type="submit" size="md" disabled={busy}>
            {busy ? pendingLabel : submitLabel}
          </Button>
        </motion.div>
      </motion.form>
    </Form>
  );
}

function formErrorMessage(error: ApiError | null): string | null {
  if (!error) return null;
  if (error.status === 0) {
    return 'Could not reach the server. Please try again in a moment.';
  }
  if (error.status === 409) {
    return 'A church with this slug already exists. Pick another.';
  }
  return error.message;
}
