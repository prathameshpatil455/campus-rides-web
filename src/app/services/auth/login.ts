import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    department: string;
    year: string;
    studentId: string;
  };
}

export const useLogin = () => {
  const apiService = inject(ApiService);

  return injectMutation(() => ({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiService.post<LoginResponse>('/auth/login', data).toPromise();
      return response?.data;
    },
  }));
};

