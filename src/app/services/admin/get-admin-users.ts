import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  department: string;
  year: string;
  studentId: string;
  phone?: string;
  role: string;
  status: string;
}

export interface GetAdminUsersParams {
  role?: string;
  status?: string;
  search?: string;
}

export const useGetAdminUsers = (params?: GetAdminUsersParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['admin', 'users', params],
    queryFn: async () => {
      const response = await apiService.get<AdminUser[]>('/admin/users', params as Record<string, string | number | boolean>).toPromise();
      return response?.data;
    },
  }));
};

