'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FiLayers } from 'react-icons/fi';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/services/api';
import { fadeUp, stagger } from '@/shared/lib/motion';
import {
  createDepartmentSchema,
  type CreateDepartmentInput,
} from '@/shared/lib/rules/departments';

export type DepartmentFormValues = CreateDepartmentInput;

interface Props {
  defaultValues?: Partial<DepartmentFormValues>;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: DepartmentFormValues) => void | Promise<unknown>;
  isPending?: boolean;
  serverError?: ApiError | null;
}

const defaultBlank: DepartmentFormValues = {
  name: '',
  description: '',
};

const inlineInput =
  'h-11 flex-1 border-0 bg-transparent p-0 text-[15px] text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:ring-0';

export function DepartmentForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  isPending = false,
  serverError = null,
}: Props) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    mode: 'onSubmit',
    defaultValues: { ...defaultBlank, ...defaultValues },
  });

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

        <motion.div variants={fadeUp}>
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <InputGroup
                    invalid={Boolean(fieldState.error)}
                    startAdornment={<FiLayers size={16} aria-hidden />}
                  >
                    <input
                      placeholder="Worship"
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
        </motion.div>

        <motion.div variants={fadeUp}>
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="What this department does, who it serves…"
                    disabled={busy}
                    aria-invalid={Boolean(fieldState.error)}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Optional. Up to 500 characters.</FormDescription>
                <FormMessage />
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
    return 'A department with this name already exists. Pick another.';
  }
  return error.message;
}
