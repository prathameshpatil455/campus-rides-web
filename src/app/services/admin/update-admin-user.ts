import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { AdminUser } from './get-admin-users';

export interface UpdateAdminUserRequest {
  role?: string;
  status?: string;
}

export const useUpdateAdminUser = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdminUserRequest }) => {
      const response = await apiService.put<AdminUser>(`/admin/users/${id}`, data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  }));
};

