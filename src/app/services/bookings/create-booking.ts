import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface CreateBookingRequest {
  rideId: string;
  seats?: number;
}

export interface CreateBookingResponse {
  id: string;
  rideId: string;
  userId: string;
  seats: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const useCreateBooking = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (data: CreateBookingRequest) => {
      const response = await apiService.post<CreateBookingResponse>('/bookings', data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  }));
};

