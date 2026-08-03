'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useCreateServiceType, useServiceTypes } from '@/hooks/attendance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  /** Selected service type id, or '' for a one-off gathering. */
  value: string;
  onChange: (serviceTypeId: string) => void;
}

/**
 * Pick the kind of gathering — and add a new kind without leaving the form,
 * the same way giving lets you create a fund while recording an entry.
 */
export function ServiceTypeField({ value, onChange }: Props) {
  const types = useServiceTypes();
  const create = useCreateServiceType();
  const [name, setName] = useState('');

  const options = types.data ?? [];
  // With nothing to pick from, the creator is the field.
  const [adding, setAdding] = useState(false);
  const showCreator = adding || (types.isSuccess && options.length === 0);

  function submitNew() {
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(
      { name: trimmed },
      {
        onSuccess: (serviceType) => {
          onChange(serviceType.id); // select what you just made
          setName('');
          setAdding(false);
        },
      },
    );
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor="serviceType" className="text-[13px] text-muted-foreground">
        Service type
      </label>

      {showCreator ? (
        <div className="flex items-center gap-2">
          <Input
            id="serviceType"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sunday Service"
            maxLength={100}
            // Enter would otherwise submit the surrounding new-service form.
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitNew();
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!name.trim() || create.isPending}
            onClick={submitNew}
          >
            {create.isPending ? 'Adding…' : 'Add'}
          </Button>
          {options.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setAdding(false);
                setName('');
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger id="serviceType" className="flex-1">
              <SelectValue placeholder="Choose a service type" />
            </SelectTrigger>
            <SelectContent>
              {options.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAdding(true)}
          >
            <FiPlus size={14} aria-hidden />
            New
          </Button>
        </div>
      )}

      {create.error ? (
        <p className="text-[12px] text-destructive">{create.error.message}</p>
      ) : null}
    </div>
  );
}
