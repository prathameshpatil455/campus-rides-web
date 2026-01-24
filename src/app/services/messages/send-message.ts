import { inject } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

interface SendMessageRequest {
  conversationId: string;
  content: string;
}

interface SendMessageResponse {
  id: string;
  conversationId: string;
  content: string;
  timestamp: string;
}

export const useSendMessage = () => {
  const apiService = inject(ApiService);
  const queryClient = inject(QueryClient);

  return injectMutation(() => ({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await apiService
        .post<SendMessageResponse>('/messages/send', data)
        .toPromise();
      return response?.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  }));
};

