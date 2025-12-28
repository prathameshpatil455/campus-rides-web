import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { User } from './get-current-user';

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
}

export const useUpdateUser = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (data: UpdateUserRequest) => {
      const response = await apiService.put<User>('/users/me', data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'current'] });
    },
  }));
};

