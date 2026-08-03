import type {
  Donation,
  DonationListItem,
  Fund,
  GivingMethod,
  GivingSummary,
} from '@/types/giving';
import { api } from '@/services/api';
import {
  clean,
  listQuery,
  type ListParams,
  type Paginated,
} from '@/shared/lib/list';

export interface ListDonationsParams extends ListParams {
  fundId?: string;
  memberId?: string;
  method?: GivingMethod;
  /** ISO date strings. */
  from?: string;
  to?: string;
  sortBy?: 'givenAt' | 'amountMinor';
  sortDir?: 'asc' | 'desc';
}

export type RecordDonationInput = {
  fundId: string;
  /** Omit for anonymous giving. */
  memberId?: string;
  /** Integer minor units — use `toMinor()` on user input. */
  amountMinor: number;
  currency?: string;
  method: GivingMethod;
  reference?: string;
  note?: string;
  givenAt: string;
};

export type CreateFundInput = { name: string; isActive?: boolean };
export type UpdateFundInput = { name?: string; isActive?: boolean };

export type DonationPage = Paginated<DonationListItem>;

function query(params: ListDonationsParams = {}): string {
  const search = new URLSearchParams(listQuery(params));
  if (params.fundId) search.set('fundId', params.fundId);
  if (params.memberId) search.set('memberId', params.memberId);
  if (params.method) search.set('method', params.method);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.sortBy) search.set('sortBy', params.sortBy);
  if (params.sortDir) search.set('sortDir', params.sortDir);
  return search.toString();
}

export const givingService = {
  listFunds: (includeInactive = false) =>
    api.get<Fund[]>(`/giving/funds?includeInactive=${includeInactive}`),
  createFund: (input: CreateFundInput) =>
    api.post<Fund>('/giving/funds', clean(input)),
  updateFund: (id: string, input: UpdateFundInput) =>
    api.patch<Fund>(`/giving/funds/${id}`, input),

  summary: (range?: { from?: string; to?: string }) => {
    const search = new URLSearchParams();
    if (range?.from) search.set('from', range.from);
    if (range?.to) search.set('to', range.to);
    const qs = search.toString();
    return api.get<GivingSummary>(`/giving/summary${qs ? `?${qs}` : ''}`);
  },

  list: (params?: ListDonationsParams): Promise<DonationPage> =>
    api.get<DonationPage>(`/giving/donations?${query(params)}`),
  record: (input: RecordDonationInput) =>
    api.post<Donation>('/giving/donations', clean(input)),
  /** Corrections are new negating rows — nothing is edited in place. */
  reverse: (id: string) =>
    api.post<Donation>(`/giving/donations/${id}/reverse`),
};
