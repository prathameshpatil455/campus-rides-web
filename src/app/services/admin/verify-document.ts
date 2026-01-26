import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { injectQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { User } from '../../types/user.types';

export interface VerifyDocumentRequest {
  userId: string;
  documentType: 'studentID' | 'license' | 'profilePhoto';
  action: 'approve' | 'reject';
  reason?: string;
}

export const useVerifyDocument = () => {
  const apiService = inject(ApiService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationFn: async (data: VerifyDocumentRequest) => {
      let endpoint: string;
      let body: { reason?: string } | undefined;

      if (data.action === 'approve') {
        endpoint = `/admin/documents/${data.userId}/${data.documentType}/verify`;
        body = undefined;
      } else {
        endpoint = `/admin/documents/${data.userId}/${data.documentType}/reject`;
        body = data.reason ? { reason: data.reason } : undefined;
      }

      const response = await apiService.patch<User>(endpoint, body).toPromise();
      return response?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  }));
};
