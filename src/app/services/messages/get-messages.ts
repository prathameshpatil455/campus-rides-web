import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface MessageResponse {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export const useGetMessages = (conversationId: string) => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const response = await apiService
        .get<MessageResponse[]>(`/messages/conversations/${conversationId}/messages`)
        .toPromise();
      return response?.data;
    },
    enabled: !!conversationId,
  }));
};

