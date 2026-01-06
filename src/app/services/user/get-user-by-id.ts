import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { User } from '../../types/user.types';

export const useGetUserById = (userId: string | null) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await apiService.get<User>(`/user/${userId}`).toPromise();
      return response?.data;
    },
    enabled: !!userId,
  }));
};
