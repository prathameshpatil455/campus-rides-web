import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from '../rides/get-rides';

export interface GetAdminRidesParams {
  status?: string;
  driverId?: string;
  date?: string;
}

export const useGetAdminRides = (params?: GetAdminRidesParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['admin', 'rides', params],
    queryFn: async () => {
      const response = await apiService.get<Ride[]>('/admin/rides', params as Record<string, string | number | boolean>).toPromise();
      return response?.data;
    },
  }));
};

