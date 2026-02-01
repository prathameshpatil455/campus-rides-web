import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Ride } from './get-rides';

export interface GetMyRidesParams {
  status?: string;
}

const DEFAULT_STATUS = 'active';

export const useGetMyRides = (getParams?: () => GetMyRidesParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => {
    const params = getParams?.() ?? { status: DEFAULT_STATUS };
    const status = params.status ?? DEFAULT_STATUS;
    const queryParams = status ? { status } : undefined;

    return {
      queryKey: ['rides', 'my', status],
      queryFn: async () => {
        const response = await apiService
          .get<Ride[]>('/rides/my', queryParams as Record<string, string | number | boolean>)
          .toPromise();
        const raw = response?.data ?? [];
        return Array.isArray(raw)
          ? (raw.map((r: Ride & { id?: string }) => ({
              ...r,
              _id:
                (r as { _id?: string; id?: string })._id ??
                (r as { _id?: string; id?: string }).id ??
                '',
            })) as Ride[])
          : raw;
      },
    };
  });
};
