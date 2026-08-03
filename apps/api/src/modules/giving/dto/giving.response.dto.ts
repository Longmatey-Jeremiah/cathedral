import { GivingMethod } from '@prisma/client';

export class FundDto {
  id!: string;
  churchId!: string;
  name!: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class DonationDto {
  id!: string;
  churchId!: string;
  memberId!: string | null;
  fundId!: string;
  amountMinor!: number;
  currency!: string;
  method!: GivingMethod;
  reference!: string | null;
  note!: string | null;
  reversesId!: string | null;
  recordedById!: string;
  givenAt!: Date;
  createdAt!: Date;
}

/** Row shape for GET /giving/donations — resolved names, no joins client-side. */
export class DonationListItemDto {
  id!: string;
  /** Null member renders as "Anonymous". */
  donor!: string | null;
  fund!: string;
  amountMinor!: number;
  currency!: string;
  method!: GivingMethod;
  reference!: string | null;
  givenAt!: Date;
  /** True when this row is a correction of an earlier entry. */
  isReversal!: boolean;
  /** True when a later row reversed this one. */
  reversed!: boolean;
}

export class FundTotalDto {
  fundId!: string;
  name!: string;
  amountMinor!: number;
  /** Percentage of the period total, rounded to a whole number. */
  share!: number;
}

export class GivingSummaryDto {
  from!: Date;
  to!: Date;
  currency!: string;
  totalMinor!: number;
  donationCount!: number;
  byFund!: FundTotalDto[];
}
