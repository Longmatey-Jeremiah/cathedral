// Department domain type — mirrors the Prisma `Department` model on the API.
export interface Department {
  id: string;
  name: string;
  description: string | null;
  churchId: string;
  createdAt: string;
  updatedAt: string;
}
