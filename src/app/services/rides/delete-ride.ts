import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export const useDeleteRide = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (id: string) => {
      const response = await apiService.delete(`/rides/${id}`).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'rides'] });
    },
  }));
};

