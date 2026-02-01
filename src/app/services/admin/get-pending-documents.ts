import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { User } from '../../types/user.types';

export interface PendingDocument {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  studentIdNumber: string;
  department: string;
  year: string;
  documentType: 'studentID' | 'license' | 'profilePhoto';
  documentStatus: 'pending' | 'approved' | 'rejected';
  documentUrl: string;
  uploadedAt: string;
  createdAt: string;
}

export interface GetPendingDocumentsParams {
  page?: number;
  limit?: number;
}

export const useGetPendingDocuments = (params?: GetPendingDocumentsParams) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['admin', 'pending-documents', params],
    queryFn: async () => {
      const queryParams: Record<string, string | number> = {};
      if (params && 'page' in params && params['page'] !== undefined) {
        queryParams['page'] = params['page'];
      }
      if (params && 'limit' in params && params['limit'] !== undefined) {
        queryParams['limit'] = params['limit'];
      }
      
      const response = await apiService.get<PendingDocument[]>('/admin/pending', queryParams).toPromise();
      return response?.data || [];
    },
  }));
};
