import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Location } from '../../types/location';

export interface Ride {
  _id: string;
  from: Location;
  to: Location;
  date: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  status: string;
  driverId: any; // Populated user object or string ID
  driverName: string;
  driverPhone?: string;
}

export interface GetRidesParams {
  from?: string;
  to?: string;
  date?: string;
}

export const useGetRides = (params?: GetRidesParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['rides', params],
    queryFn: async () => {
      const response = await apiService.get<Ride[]>('/rides', params as Record<string, string | number | boolean>).toPromise();
      return response?.data;
    },
  }));
};

