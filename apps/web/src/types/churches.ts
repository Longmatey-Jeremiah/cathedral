// Church domain type — mirrors the Prisma `Church` model on the API side.

export interface Church {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  /** ISO 4217 code used to seed new donations in this branch. */
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
}
