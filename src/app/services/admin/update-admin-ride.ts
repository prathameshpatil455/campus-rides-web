import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from '../rides/get-rides';

export interface UpdateAdminRideRequest {
  status?: string;
}

export const useUpdateAdminRide = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAdminRideRequest }) => {
      const response = await apiService.put<Ride>(`/admin/rides/${id}`, data).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rides'] });
      queryClient.invalidateQueries({ queryKey: ['rides'] });
    },
  }));
};

