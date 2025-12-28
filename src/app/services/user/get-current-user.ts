import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  department: string;
  year: string;
  studentId: string;
  phone?: string;
  role?: string;
}

export const useGetCurrentUser = () => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['user', 'current'],
    queryFn: async () => {
      const response = await apiService.get<User>('/users/me').toPromise();
      return response?.data;
    },
  }));
};

