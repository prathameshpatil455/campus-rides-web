import { inject } from '@angular/core';
import { injectMutation, injectQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { User } from '../../types/user.types';
import { AuthService } from '../auth/auth.service';

export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  department: string;
  year: string;
  vehicleInfo: {
    model?: string;
    color?: string;
    plateNumber?: string;
  };
}

export const useUpdateUser = () => {
  const apiService = inject(ApiService);
  const authService = inject(AuthService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationFn: async (data: UpdateUserRequest) => {
      const userId = authService.getUserId();
      if (!userId) {
        throw new Error('User ID is required');
      }
      const response = await apiService.put<User>(`/user/update`, data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      const userId = authService.getUserId();
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      }
    },
  }));
};
