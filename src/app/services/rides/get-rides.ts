import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { Location } from '../../types/location';

export interface RideLocation {
  type?: string;
  name?: string;
  address?: string;
  coordinates?: { lat?: number; lng?: number; latitude?: number; longitude?: number };
  _id?: string;
}

export interface Ride {
  _id: string;
  from?: Location | RideLocation;
  to?: Location | RideLocation;
  pickup?: RideLocation;
  destination?: RideLocation;
  date?: string;
  time: string;
  availableSeats: number;
  totalSeats?: number;
  price: number;
  status: string;
  driverId:
    | {
        _id: string;
        firstName?: string;
        lastName?: string;
        fullName?: string;
        [key: string]: unknown;
      }
    | string;
  driverName?: string;
  driverPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetRidesParams {
  from?: string;
  to?: string;
  date?: string;
  status?: string;
  pickup?: string;
  limit?: number;
  page?: number;
}

const normalizeRides = (raw: unknown): Ride[] => {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: Ride & { id?: string }) => ({
    ...r,
    _id:
      (r as { _id?: string; id?: string })._id ??
      (r as { _id?: string; id?: string }).id ??
      '',
  })) as Ride[];
};

export interface RidesPaginatedResponse {
  rides: Ride[];
  total: number;
  page: number;
  totalPages: number;
}

export const useGetRides = (params?: GetRidesParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['rides', params],
    queryFn: async () => {
      const response = await apiService
        .get<Ride[] | (Ride[] & { total?: number; page?: number; totalPages?: number })>(
          '/rides',
          params as Record<string, string | number | boolean>
        )
        .toPromise();
      const raw = response?.data ?? [];
      return normalizeRides(raw);
    },
  }));
};

export const useGetRidesPaginated = (getParams: () => GetRidesParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => {
    const params = getParams();
    const limit = params.limit ?? 10;
    const page = params.page ?? 1;

    return {
      queryKey: ['rides', 'list', params.status, params['pickup'], limit, page],
      queryFn: async (): Promise<RidesPaginatedResponse> => {
        const queryParams: Record<string, string | number | boolean> = {
          status: params.status ?? 'active',
          limit,
          page,
        };
        if (params['pickup']) queryParams['pickup'] = params['pickup'];

        const response = await apiService
          .get<Ride[] & { total?: number; page?: number; totalPages?: number }>(
            '/rides',
            queryParams
          )
          .toPromise();

        const raw = response?.data;
        const rides = normalizeRides(Array.isArray(raw) ? raw : []);
        const res = response as unknown as { total?: number; page?: number; totalPages?: number };
        const total = res?.total ?? rides.length;
        const totalPages = res?.totalPages ?? Math.max(1, Math.ceil(total / limit));

        return {
          rides,
          total,
          page: res?.page ?? page,
          totalPages,
        };
      },
    };
  });
};
