import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface Booking {
  id: string;
  rideId: string;
  ride: {
    id: string;
    from: string;
    to: string;
    date: string;
    time: string;
    price: number;
    driverName: string;
  };
  seats: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const useGetMyBookings = () => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['bookings', 'my'],
    queryFn: async () => {
      const response = await apiService.get<Booking[]>('/bookings/my').toPromise();
      return response?.data;
    },
  }));
};

