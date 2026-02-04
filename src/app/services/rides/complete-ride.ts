import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from './get-rides';

export const useCompleteRide = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (rideId: string) => {
      const response = await apiService
        .patch<Ride>(`/rides/${rideId}/complete`, undefined)
        .toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'rides'] });
    },
  }));
};
