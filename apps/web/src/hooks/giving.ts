'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  givingService,
  type CreateFundInput,
  type DonationPage,
  type ListDonationsParams,
  type RecordDonationInput,
} from '@/services/giving.service';
import type { ApiError } from '@/services/api';
import type { Donation, Fund, GivingSummary } from '@/types/giving';

export const givingKeys = {
  all: ['giving'] as const,
  funds: (includeInactive = false) =>
    [...givingKeys.all, 'funds', includeInactive] as const,
  summary: (range?: { from?: string; to?: string }) =>
    [...givingKeys.all, 'summary', range ?? {}] as const,
  lists: () => [...givingKeys.all, 'donations'] as const,
  list: (params: ListDonationsParams = {}) =>
    [...givingKeys.lists(), params] as const,
};

export function useFunds(includeInactive = false) {
  return useQuery<Fund[], ApiError>({
    queryKey: givingKeys.funds(includeInactive),
    queryFn: () => givingService.listFunds(includeInactive),
  });
}

export function useGivingSummary(range?: { from?: string; to?: string }) {
  return useQuery<GivingSummary, ApiError>({
    queryKey: givingKeys.summary(range),
    queryFn: () => givingService.summary(range),
  });
}

export function useDonations(params: ListDonationsParams = {}) {
  return useQuery<DonationPage, ApiError>({
    queryKey: givingKeys.list(params),
    queryFn: () => givingService.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateFund(
  options?: UseMutationOptions<Fund, ApiError, CreateFundInput>,
) {
  const qc = useQueryClient();
  return useMutation<Fund, ApiError, CreateFundInput>({
    mutationFn: givingService.createFund,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: givingKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useRecordDonation(
  options?: UseMutationOptions<Donation, ApiError, RecordDonationInput>,
) {
  const qc = useQueryClient();
  return useMutation<Donation, ApiError, RecordDonationInput>({
    mutationFn: givingService.record,
    onSuccess: (data, variables, onMutateResult, context) => {
      // Both the ledger and the totals move on every entry.
      qc.invalidateQueries({ queryKey: givingKeys.all });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useReverseDonation(
  options?: UseMutationOptions<Donation, ApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<Donation, ApiError, string>({
    mutationFn: (id) => givingService.reverse(id),
    onSuccess: (data, id, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: givingKeys.all });
      options?.onSuccess?.(data, id, onMutateResult, context);
    },
    ...options,
  });
}
