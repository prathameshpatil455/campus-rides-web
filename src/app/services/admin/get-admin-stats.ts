import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface AdminStats {
  totalUsers: number;
  totalRides: number;
  pendingDocuments: number;
  activeRides: number;
}

export const useGetAdminStats = () => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await apiService.get<AdminStats>('/admin/stats').toPromise();
      return response?.data;
    },
  }));
};
