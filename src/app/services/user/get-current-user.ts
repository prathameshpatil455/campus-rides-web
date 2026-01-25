import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { AuthService } from '../auth/auth.service';
import { User } from '../../types/user.types';

export const useGetCurrentUser = () => {
  const apiService = inject(ApiService);
  const authService = inject(AuthService);

  return injectQuery(() => {
    const userId = authService.getUserId();
    
    return {
      queryKey: ['user', userId],
      queryFn: async () => {
        if (!userId) {
          throw new Error('User ID is required');
        }
        const response = await apiService.get<User>(`/user/${userId}`).toPromise();
        return response?.data;
      },
      enabled: !!userId,
    };
  });
};
