import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface DocumentResponse {
  success: boolean;
  documentType: 'studentID' | 'license' | 'profilePhoto';
  url: string;
  contentType: string;
}

export const useGetDocument = (documentType: 'studentID' | 'license' | 'profilePhoto' | null) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['document', documentType],
    queryFn: async () => {
      if (!documentType) {
        return null;
      }
      try {
        const response = await apiService.get<DocumentResponse>('/user/documents', {
          documentType,
        }).toPromise();
        
        return response?.data || null;
      } catch (error) {
        return null;
      }
    },
    enabled: !!documentType,
  }));
};
