'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FiAtSign, FiHome, FiMapPin, FiPhone } from 'react-icons/fi';
import { PanelCard } from '@/components/admin/PanelCard';
import { FormSkeleton } from '@/components/admin/Skeleton';
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
import { Input, InputGroup, inlineInput } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/auth-context';
import { useChurch, useUpdateChurch } from '@/hooks/churches';
import { CURRENCIES } from '@/shared/lib/money';
import {
  branchSettingsSchema,
  type BranchSettingsInput,
} from '@/shared/lib/rules/churches';

/**
 * The branch record as its own admin sees it. Slug and active status are
 * deliberately absent — those are platform controls, and the API rejects them
 * from anyone but a super admin.
 */
export function BranchSettingsCard() {
  const { user } = useAuth();
  const churchId = user?.churchId ?? undefined;
  const { data: church, isLoading, error } = useChurch(churchId);
  const update = useUpdateChurch(churchId ?? '', {
    onSuccess: () => toast.success('Branch settings saved'),
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<BranchSettingsInput>({
    resolver: zodResolver(branchSettingsSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      defaultCurrency: 'NGN',
    },
  });

  // The record arrives after first paint; seed the fields once it lands.
  const { reset } = form;
  useEffect(() => {
    if (!church) return;
    reset({
      name: church.name,
      address: church.address ?? '',
      phone: church.phone ?? '',
      email: church.email ?? '',
      defaultCurrency: church.defaultCurrency,
    });
  }, [church, reset]);

  if (!churchId) {
    return (
      <PanelCard
        title="Branch"
        subtitle="Your account is not attached to a branch."
      >
        <p className="text-[13px] text-muted-foreground">
          Super admins manage every branch from the Churches page.
        </p>
      </PanelCard>
    );
  }

  const busy = update.isPending || form.formState.isSubmitting;

  return (
    <PanelCard
      title="Branch"
      subtitle="Details and defaults for this church. Visible across the dashboard."
    >
      {error ? (
        <Alert>
          {error.status === 0
            ? 'Could not reach the server. Try again in a moment.'
            : error.message}
        </Alert>
      ) : isLoading || !church ? (
        <FormSkeleton fields={4} />
      ) : (
        <Form {...form}>
          <form
            noValidate
            onSubmit={form.handleSubmit((values) => update.mutate(values))}
            className="flex flex-col gap-5"
            aria-busy={busy || undefined}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Branch name</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiHome size={16} aria-hidden />}
                    >
                      <Input
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
              name="address"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <InputGroup
                      invalid={Boolean(fieldState.error)}
                      startAdornment={<FiMapPin size={16} aria-hidden />}
                    >
                      <Input
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

            <div className="grid gap-5 sm:grid-cols-2">
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
                        <Input
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
                        <Input
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
            </div>

            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem className="sm:max-w-[50%]">
                  <FormLabel>Default currency</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} — {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Applied to new giving records. Existing entries keep the
                    currency they were recorded in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" size="md" disabled={busy}>
                {busy ? 'Saving…' : 'Save branch settings'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </PanelCard>
  );
}
