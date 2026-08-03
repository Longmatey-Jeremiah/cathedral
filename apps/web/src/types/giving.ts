export const GivingMethod = {
  CASH: 'CASH',
  TRANSFER: 'TRANSFER',
  CARD: 'CARD',
  MOBILE_MONEY: 'MOBILE_MONEY',
} as const;
export type GivingMethod = (typeof GivingMethod)[keyof typeof GivingMethod];

export const methodLabel: Record<GivingMethod, string> = {
  CASH: 'Cash',
  TRANSFER: 'Bank transfer',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile money',
};

export interface Fund {
  id: string;
  churchId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A ledger row. Amounts are minor units — never render them raw. */
export interface Donation {
  id: string;
  churchId: string;
  memberId: string | null;
  fundId: string;
  amountMinor: number;
  currency: string;
  method: GivingMethod;
  reference: string | null;
  note: string | null;
  reversesId: string | null;
  recordedById: string;
  givenAt: string;
  createdAt: string;
}

export interface DonationListItem {
  id: string;
  /** Null means anonymous giving. */
  donor: string | null;
  fund: string;
  amountMinor: number;
  currency: string;
  method: GivingMethod;
  reference: string | null;
  givenAt: string;
  /** This row is a correction of an earlier entry. */
  isReversal: boolean;
  /** A later row reversed this one. */
  reversed: boolean;
}

export interface FundTotal {
  fundId: string;
  name: string;
  amountMinor: number;
  share: number;
}

export interface GivingSummary {
  from: string;
  to: string;
  currency: string;
  totalMinor: number;
  donationCount: number;
  byFund: FundTotal[];
}
