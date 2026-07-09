export class DepartmentDto {
  id!: string;
  name!: string;
  description?: string | null;
  churchId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
