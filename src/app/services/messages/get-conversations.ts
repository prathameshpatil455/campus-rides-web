import { inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ApiService } from '../api';

export interface ConversationResponse {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  lastMessage: string;
  route: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export const useGetConversations = () => {
  const apiService = inject(ApiService);

  return injectQuery(() => ({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await apiService
        .get<ConversationResponse[]>('/messages/conversations')
        .toPromise();
      return response?.data;
    },
  }));
};
