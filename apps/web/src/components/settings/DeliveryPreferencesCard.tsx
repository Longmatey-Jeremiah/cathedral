'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { FiPhone } from 'react-icons/fi';
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
import { useMe, useUpdateMyNotificationPreferences } from '@/hooks/users';
import { NotificationChannel } from '@/shared/lib/types';
import {
  deliveryPreferencesSchema,
  type DeliveryPreferencesInput,
} from '@/shared/lib/rules/users';

const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: 'Email only',
  SMS: 'Text message only',
  BOTH: 'Email and text',
};

/**
 * How you get notified — invites, temporary passwords, attendance reviews.
 * SMS/BOTH need a phone on file; the server falls back to email for a
 * notification if one is missing rather than dropping it silently.
 */
export function DeliveryPreferencesCard() {
  const { data: me, isLoading, error } = useMe();
  const update = useUpdateMyNotificationPreferences({
    onSuccess: () => toast.success('Delivery preferences saved'),
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<DeliveryPreferencesInput>({
    resolver: zodResolver(deliveryPreferencesSchema),
    mode: 'onSubmit',
    defaultValues: { phone: '', notifyVia: NotificationChannel.EMAIL },
  });

  const { reset } = form;
  useEffect(() => {
    if (!me) return;
    reset({ phone: me.phone ?? '', notifyVia: me.notifyVia });
  }, [me, reset]);

  const busy = update.isPending || form.formState.isSubmitting;
  const notifyVia = form.watch('notifyVia');
  const needsPhone = notifyVia !== NotificationChannel.EMAIL;

  return (
    <PanelCard
      title="Delivery method"
      subtitle="How invites, temporary passwords, and attendance reviews reach you."
    >
      {error ? (
        <Alert>
          {error.status === 0
            ? 'Could not reach the server. Try again in a moment.'
            : error.message}
        </Alert>
      ) : isLoading || !me ? (
        <FormSkeleton fields={2} />
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
              name="notifyVia"
              render={({ field }) => (
                <FormItem className="sm:max-w-[50%]">
                  <FormLabel>Send notifications by</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={busy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(NotificationChannel).map((c) => (
                          <SelectItem key={c} value={c}>
                            {CHANNEL_LABELS[c]}
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
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>
                    Phone{needsPhone ? '' : ' (optional)'}
                  </FormLabel>
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
                  {needsPhone ? (
                    <FormDescription>
                      Required for text delivery. Without one on file, texts
                      fall back to email.
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" size="md" disabled={busy}>
                {busy ? 'Saving…' : 'Save delivery preferences'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </PanelCard>
  );
}
