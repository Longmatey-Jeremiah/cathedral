'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { departmentsService } from '@/services/departments.service';
import type { ApiError } from '@/services/api';
import type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from '@/shared/lib/rules/departments';
import type { Department } from '@/types/departments';

export const departmentKeys = {
  all: ['departments'] as const,
  list: () => [...departmentKeys.all, 'list'] as const,
  detail: (id: string) => [...departmentKeys.all, 'detail', id] as const,
};

export function useDepartments() {
  return useQuery<Department[], ApiError>({
    queryKey: departmentKeys.list(),
    queryFn: departmentsService.list,
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery<Department, ApiError>({
    queryKey: departmentKeys.detail(id ?? ''),
    queryFn: () => departmentsService.get(id as string),
    enabled: Boolean(id),
  });
}

export function useCreateDepartment(
  options?: UseMutationOptions<Department, ApiError, CreateDepartmentInput>,
) {
  const qc = useQueryClient();
  return useMutation<Department, ApiError, CreateDepartmentInput>({
    mutationFn: departmentsService.create,
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: departmentKeys.list() });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useUpdateDepartment(
  id: string,
  options?: UseMutationOptions<Department, ApiError, UpdateDepartmentInput>,
) {
  const qc = useQueryClient();
  return useMutation<Department, ApiError, UpdateDepartmentInput>({
    mutationFn: (input) => departmentsService.update(id, input),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: departmentKeys.list() });
      qc.invalidateQueries({ queryKey: departmentKeys.detail(id) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}

export function useDeleteDepartment(
  options?: UseMutationOptions<{ success: true }, ApiError, string>,
) {
  const qc = useQueryClient();
  return useMutation<{ success: true }, ApiError, string>({
    mutationFn: (id) => departmentsService.remove(id),
    onSuccess: (data, variables, onMutateResult, context) => {
      qc.invalidateQueries({ queryKey: departmentKeys.list() });
      qc.removeQueries({ queryKey: departmentKeys.detail(variables) });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
    ...options,
  });
}
