'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { FiPhone, FiUser } from 'react-icons/fi';
import type { ReactNode } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { ApiError } from '@/services/api';
import type { CreateMemberInput } from '@/services/members.service';
import { memberSchema, type MemberFormInput } from '@/shared/lib/rules/members';
import { fadeUp, stagger } from '@/shared/lib/motion';
import type { Member } from '@/types/members';

type FieldName = keyof MemberFormInput;

const BLANK: MemberFormInput = {
  lastName: '',
  firstName: '',
  phone: '',
  status: 'VISITOR',
  sex: '',
  dateOfBirth: '',
  placeOfBirth: '',
  address: '',
  placeOfResidence: '',
  occupation: '',
  placeOfWork: '',
  society: '',
  nextOfKin: '',
  parentsName: '',
  hometown: '',
  maritalStatus: '',
  spouseName: '',
  spouseOccupation: '',
  religiousDenomination: '',
  childrenNames: '',
  declarationDate: '',
};

/** Member → form values. Dates arrive ISO; the native date input wants yyyy-mm-dd. */
export function toMemberFormValues(member: Member): MemberFormInput {
  return {
    ...BLANK,
    lastName: member.lastName,
    firstName: member.firstName,
    phone: member.phone ?? '',
    status: member.status,
    sex: member.sex ?? '',
    dateOfBirth: member.dateOfBirth?.slice(0, 10) ?? '',
    placeOfBirth: member.placeOfBirth ?? '',
    address: member.address ?? '',
    placeOfResidence: member.placeOfResidence ?? '',
    occupation: member.occupation ?? '',
    placeOfWork: member.placeOfWork ?? '',
    society: member.society ?? '',
    nextOfKin: member.nextOfKin ?? '',
    parentsName: member.parentsName ?? '',
    hometown: member.hometown ?? '',
    maritalStatus: member.maritalStatus ?? '',
    spouseName: member.spouseName ?? '',
    spouseOccupation: member.spouseOccupation ?? '',
    religiousDenomination: member.religiousDenomination ?? '',
    childrenNames: member.childrenNames.join('\n'),
    declarationDate: member.declarationDate?.slice(0, 10) ?? '',
  };
}

const blank = (value?: string) => (value?.trim() ? value.trim() : undefined);
const isoDate = (value?: string) =>
  value ? new Date(`${value}T00:00:00.000Z`).toISOString() : undefined;

/** Form values → API payload: '' becomes omitted, children become an array. */
export function toMemberPayload(values: MemberFormInput): CreateMemberInput {
  return {
    lastName: values.lastName.trim(),
    firstName: values.firstName.trim(),
    phone: blank(values.phone),
    status: values.status,
    sex: values.sex || undefined,
    dateOfBirth: isoDate(values.dateOfBirth),
    placeOfBirth: blank(values.placeOfBirth),
    address: blank(values.address),
    placeOfResidence: blank(values.placeOfResidence),
    occupation: blank(values.occupation),
    placeOfWork: blank(values.placeOfWork),
    society: blank(values.society),
    nextOfKin: blank(values.nextOfKin),
    parentsName: blank(values.parentsName),
    hometown: blank(values.hometown),
    maritalStatus: values.maritalStatus || undefined,
    spouseName: blank(values.spouseName),
    spouseOccupation: blank(values.spouseOccupation),
    religiousDenomination: blank(values.religiousDenomination),
    childrenNames: (values.childrenNames ?? '')
      .split('\n')
      .map((name) => name.trim())
      .filter(Boolean),
    declarationDate: isoDate(values.declarationDate),
  };
}

interface Props {
  defaultValues?: MemberFormInput;
  submitLabel: string;
  pendingLabel: string;
  onSubmit: (values: MemberFormInput) => void;
  isPending?: boolean;
  serverError?: ApiError | null;
}

/** The membership registration form, shared by the add and edit screens. */
export function MemberForm({
  defaultValues,
  submitLabel,
  pendingLabel,
  onSubmit,
  isPending = false,
  serverError = null,
}: Props) {
  const form = useForm<MemberFormInput>({
    resolver: zodResolver(memberSchema),
    mode: 'onSubmit',
    defaultValues: defaultValues ?? BLANK,
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
        className="flex flex-col gap-8"
        aria-busy={busy || undefined}
      >
        {formError ? (
          <motion.div variants={fadeUp}>
            <Alert>{formError}</Alert>
          </motion.div>
        ) : null}

        <Section title="Personal">
          <Text
            form={form}
            name="lastName"
            label="Surname"
            placeholder="Mensah"
            icon={<FiUser size={16} aria-hidden />}
          />
          <Text
            form={form}
            name="firstName"
            label="Other names"
            placeholder="Naana Efua"
          />
          <Choice
            form={form}
            name="sex"
            label="Sex"
            placeholder="Not stated"
            options={[
              { value: 'MALE', label: 'Male' },
              { value: 'FEMALE', label: 'Female' },
            ]}
          />
          <Text form={form} name="dateOfBirth" label="Date of birth" type="date" />
          <Text
            form={form}
            name="placeOfBirth"
            label="Place of birth"
            placeholder="Accra"
          />
          <Text form={form} name="hometown" label="Hometown" placeholder="Kumasi" />
        </Section>

        <Section title="Contact">
          <Text
            form={form}
            name="phone"
            label="Tel. no."
            type="tel"
            placeholder="+233 55 123 4567"
            icon={<FiPhone size={16} aria-hidden />}
          />
          <Text
            form={form}
            name="address"
            label="Address"
            placeholder="P.O. Box 123, Accra"
          />
          <Text
            form={form}
            name="placeOfResidence"
            label="Place of residence"
            placeholder="Adenta"
          />
        </Section>

        <Section title="Work & society">
          <Text
            form={form}
            name="occupation"
            label="Occupation"
            placeholder="Teacher"
          />
          <Text
            form={form}
            name="placeOfWork"
            label="Place of work"
            placeholder="Accra High School"
          />
          <Text
            form={form}
            name="society"
            label="Society"
            placeholder="Men's Fellowship"
          />
        </Section>

        <Section title="Family">
          <Choice
            form={form}
            name="maritalStatus"
            label="Marital status"
            placeholder="Not stated"
            options={[
              { value: 'SINGLE', label: 'Single' },
              { value: 'MARRIED', label: 'Married' },
              { value: 'WIDOWED', label: 'Widowed' },
              { value: 'DIVORCED', label: 'Divorced' },
            ]}
          />
          <Text
            form={form}
            name="spouseName"
            label="Name of spouse"
            placeholder="Kwame Mensah"
          />
          <Text
            form={form}
            name="spouseOccupation"
            label="Spouse occupation"
            placeholder="Trader"
          />
          <Text
            form={form}
            name="parentsName"
            label="Name of parents"
            placeholder="Mr. & Mrs. Mensah"
          />
          <Text
            form={form}
            name="nextOfKin"
            label="Next of kin"
            placeholder="Efua Mensah"
          />
          <FormField
            control={form.control}
            name="childrenNames"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Name of children</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder={'One name per line'}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Church">
          <Text
            form={form}
            name="religiousDenomination"
            label="Religious denomination"
            placeholder="Methodist"
          />
          <Choice
            form={form}
            name="status"
            label="Membership status"
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'VISITOR', label: 'Visitor' },
            ]}
          />
          <Text
            form={form}
            name="declarationDate"
            label="Declaration date"
            type="date"
          />
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? pendingLabel : submitLabel}
          </Button>
        </div>
      </motion.form>
    </Form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.fieldset variants={fadeUp} className="space-y-4">
      <legend className="text-[12px] uppercase tracking-[0.1em] text-pebble">
        {title}
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </motion.fieldset>
  );
}

function Text({
  form,
  name,
  label,
  placeholder,
  type,
  icon,
}: {
  form: UseFormReturn<MemberFormInput>;
  name: FieldName;
  label: string;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <InputGroup
              invalid={Boolean(fieldState.error)}
              startAdornment={icon}
            >
              <Input
                type={type}
                placeholder={placeholder}
                className={inlineInput}
                {...field}
              />
            </InputGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function Choice({
  form,
  name,
  label,
  options,
  placeholder,
}: {
  form: UseFormReturn<MemberFormInput>;
  name: FieldName;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
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
