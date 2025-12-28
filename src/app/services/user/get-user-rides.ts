import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface UserRide {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  price: number;
  status: string;
  driverId: string;
  driverName: string;
}

export const useGetUserRides = () => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['user', 'rides'],
    queryFn: async () => {
      const response = await apiService.get<UserRide[]>('/users/me/rides').toPromise();
      return response?.data;
    },
  }));
};

