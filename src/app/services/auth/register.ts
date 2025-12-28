import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  studentIdNumber: string;
  department: string;
  year: string;
  password: string;
  role: string;
}

export interface RegisterResponse {
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

export const useRegister = () => {
  const apiService = inject(ApiService);

  return injectMutation(() => ({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiService.post<RegisterResponse>('/auth/register', data).toPromise();
      return response?.data;
    },
  }));
};

