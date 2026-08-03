export class ChurchDto {
  id!: string;
  name!: string;
  slug!: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive!: boolean;
  defaultCurrency!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

/** POST /churches also provisions the first admin and returns their invite link. */
export class ChurchWithInviteDto extends ChurchDto {
  inviteUrl!: string;
}
