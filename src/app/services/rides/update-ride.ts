import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from './get-rides';

export interface UpdateRideRequest {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  totalSeats?: number;
  price?: number;
  status?: string;
}

export const useUpdateRide = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRideRequest }) => {
      const response = await apiService.put<Ride>(`/rides/${id}`, data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'rides'] });
    },
  }));
};

