import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { injectQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';
import { AuthService } from '../auth/auth.service';
import { User } from '../../types/user.types';

export interface UploadDocumentRequest {
  documentType: 'studentID' | 'license' | 'profilePhoto';
  file: File;
}

export const useUploadDocument = () => {
  const apiService = inject(ApiService);
  const authService = inject(AuthService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationFn: async ({ documentType, file }: UploadDocumentRequest) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);

      const response = await apiService.putFile<User>(`/user/documents`, formData).toPromise();
      return response?.data;
    },
    onSuccess: (data) => {
      const userId = authService.getUserId();
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
      }
    },
  }));
};
