import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from './get-rides';
import { Location } from '../../types/location';

export interface CreateRideRequest {
  from: Location;
  to: Location;
  date: string;
  time: string;
  totalSeats: number;
  price: number;
}

export const useCreateRide = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (data: CreateRideRequest) => {
      const response = await apiService.post<Ride>('/rides', data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'rides'] });
    },
  }));
};

