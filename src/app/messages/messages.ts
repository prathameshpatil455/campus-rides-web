import {
  Component,
  inject,
  signal,
  computed,
  effect,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from '../services/auth/auth.service';
import { getInitials, getFullName } from '../utils/name.utils';
import { useGetConversations, ConversationResponse } from '../services/messages/get-conversations';
import { MessageResponse } from '../services/messages/get-messages';
import { useSendMessage } from '../services/messages/send-message';
import { WebSocketService, WebSocketMessage } from '../services/messages/websocket.service';
import { ApiService } from '../services/api';

interface Conversation {
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

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
}

interface ActiveChat {
  userId: string;
  userName: string;
  userInitials: string;
  isOnline: boolean;
  route: string;
  date: string;
  time: string;
  messages: ChatMessage[];
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnDestroy, AfterViewChecked {
  @ViewChild('chatMessagesContainer', { static: false })
  chatMessagesContainer!: ElementRef<HTMLDivElement>;

  private scrollTimeoutId?: number;
  private authService = inject(AuthService);
  private router = inject(Router);
  wsService = inject(WebSocketService);
  private apiService = inject(ApiService);
  private wsSubscription?: any;

  isDriverMode = true;
  searchQuery = signal('');
  messageInput = '';
  selectedConversationId = signal<string | null>(null);

  conversationsQuery = useGetConversations();
  sendMessageMutation = useSendMessage();

  messagesData = signal<MessageResponse[] | null>(null);
  messagesLoading = signal(false);
  messagesError = signal<Error | null>(null);

  private localMessages = signal<Record<string, ChatMessage[]>>({});
  private conversationsList = signal<Conversation[]>([]);

  private dummyConversations: Conversation[] = [
    {
      id: '1',
      userId: 'sarah-chen',
      userName: 'Sarah Chen',
      userInitials: 'SC',
      lastMessage: "I'll be at the main gate in 5 minutes",
      route: 'Main Gate → Engineering Block',
      timestamp: 'Yesterday',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: '2',
      userId: 'emily-davis',
      userName: 'Emily Davis',
      userInitials: 'ED',
      lastMessage: 'Thanks for the ride!',
      route: 'Hostel A → Computer Science Block',
      timestamp: '2:10 PM',
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: '3',
      userId: 'james-wilson',
      userName: 'James Wilson',
      userInitials: 'JW',
      lastMessage: 'The ride was smooth, thanks!',
      route: 'Main Gate → Medical Center',
      timestamp: '5:30 PM',
      unreadCount: 1,
      isOnline: true,
    },
  ];

  private dummyMessages: Record<string, ChatMessage[]> = {
    'sarah-chen': [
      {
        id: '1',
        senderId: 'sarah-chen',
        senderName: 'Sarah Chen',
        content: 'Hi! I booked a seat on your ride tomorrow.',
        timestamp: '10:30 AM',
        isOwn: false,
      },
      {
        id: '2',
        senderId: 'current-user',
        senderName: 'You',
        content: 'Great! See you at the main gate at 8:30 AM',
        timestamp: '10:32 AM',
        isOwn: true,
      },
      {
        id: '3',
        senderId: 'sarah-chen',
        senderName: 'Sarah Chen',
        content: 'Perfect! Should I look for a silver Toyota?',
        timestamp: '10:35 AM',
        isOwn: false,
      },
      {
        id: '4',
        senderId: 'current-user',
        senderName: 'You',
        content: "Yes, Toyota Corolla. I'll flash my lights when I see you.",
        timestamp: '10:36 AM',
        isOwn: true,
      },
      {
        id: '5',
        senderId: 'sarah-chen',
        senderName: 'Sarah Chen',
        content: "I'll be at the main gate in 5 minutes",
        timestamp: 'Yesterday',
        isOwn: false,
      },
    ],
    'emily-davis': [
      {
        id: '1',
        senderId: 'emily-davis',
        senderName: 'Emily Davis',
        content: 'Thanks for the ride today!',
        timestamp: '2:05 PM',
        isOwn: false,
      },
      {
        id: '2',
        senderId: 'current-user',
        senderName: 'You',
        content: "You're welcome! Happy to help.",
        timestamp: '2:10 PM',
        isOwn: true,
      },
    ],
    'james-wilson': [
      {
        id: '1',
        senderId: 'current-user',
        senderName: 'You',
        content: 'How was the ride?',
        timestamp: '5:25 PM',
        isOwn: true,
      },
      {
        id: '2',
        senderId: 'james-wilson',
        senderName: 'James Wilson',
        content: 'The ride was smooth, thanks!',
        timestamp: '5:30 PM',
        isOwn: false,
      },
    ],
  };

  constructor() {
    this.localMessages.set({ ...this.dummyMessages });
    this.conversationsList.set([...this.dummyConversations]);

    // Connect WebSocket on component initialization
    this.wsService.connect();

    // Subscribe to WebSocket messages
    this.wsSubscription = this.wsService.getMessages().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });

    // Update conversations list when query data changes
    effect(() => {
      const data = this.conversationsQuery.data();
      if (data && data.length > 0) {
        const mapped = data.map((conv) => ({
          id: conv.id,
          userId: conv.userId,
          userName: conv.userName,
          userInitials: conv.userInitials,
          lastMessage: conv.lastMessage,
          route: conv.route,
          timestamp: conv.timestamp,
          unreadCount: conv.unreadCount,
          isOnline: conv.isOnline,
        }));
        this.conversationsList.set(mapped);
      }
    });

    // Scroll to bottom when activeChat changes (messages loaded)
    effect(() => {
      const activeChat = this.activeChat();
      const loading = this.messagesLoading();
      const selectedId = this.selectedConversationId();
      if (activeChat && activeChat.messages.length > 0 && !loading && selectedId) {
        this.scheduleScroll(150);
      }
    });
  }

  private async fetchMessages(conversationId: string) {
    this.messagesLoading.set(true);
    this.messagesError.set(null);
    this.messagesData.set(null);

    try {
      const endpoint = `/messages/conversations/${conversationId}/messages`;
      const response = await this.apiService.get<MessageResponse[]>(endpoint).toPromise();
      this.messagesData.set(response?.data || null);
    } catch (error) {
      this.messagesError.set(error as Error);
      this.messagesData.set(null);
    } finally {
      this.messagesLoading.set(false);
      this.scheduleScroll();
    }
  }

  conversations = computed(() => {
    const list = this.conversationsList();
    return list.length > 0 ? list : this.dummyConversations;
  });

  activeChat = computed<ActiveChat | null>(() => {
    const conversationId = this.selectedConversationId();
    if (!conversationId) {
      return null;
    }

    const conversations = this.conversations();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      return null;
    }

    const messagesData = this.messagesData();
    const localMsgs = this.localMessages();

    let messages: ChatMessage[] = [];

    // Merge API messages with local messages (WebSocket + optimistic updates)
    if (messagesData && messagesData.length > 0) {
      const apiMessages = messagesData.map((msg) => ({
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        content: msg.content,
        timestamp: msg.timestamp,
        isOwn: msg.isOwn,
        isDelivered: true,
        isRead: false,
      }));

      const localForConv = localMsgs[conversationId] || [];
      const apiMessageIds = new Set(apiMessages.map((m) => m.id));

      const uniqueLocalMessages = localForConv.filter((m) => {
        if (apiMessageIds.has(m.id)) {
          return false;
        }
        if (m.isOwn) {
          const hasMatchingContent = apiMessages.some(
            (apiMsg) => apiMsg.isOwn && apiMsg.content === m.content
          );
          if (hasMatchingContent) {
            return false;
          }
        }
        return true;
      });

      messages = [...apiMessages, ...uniqueLocalMessages].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeA - timeB;
      });
    } else if (localMsgs[conversationId]) {
      messages = localMsgs[conversationId];
    } else if (this.dummyMessages[conversation.userId]) {
      messages = this.dummyMessages[conversation.userId];
    }

    return {
      userId: conversation.userId,
      userName: conversation.userName,
      userInitials: conversation.userInitials,
      isOnline: conversation.isOnline,
      route: conversation.route,
      date: '2024-12-02',
      time: '08:30',
      messages,
    };
  });

  quickReplies = ['On my way!', "I'll be there in 5 mins", 'Thanks!', 'See you soon'];

  get currentUser() {
    const user = this.authService.getUserData();
    return {
      name: getFullName(user?.firstName, user?.lastName),
      initials: getInitials(user?.firstName, user?.lastName),
      department: user?.department || 'N/A',
    };
  }

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const conversations = this.conversations();
    if (!query.trim()) {
      return conversations;
    }
    return conversations.filter(
      (conv: Conversation) =>
        conv.userName.toLowerCase().includes(query) ||
        conv.lastMessage.toLowerCase().includes(query) ||
        conv.route.toLowerCase().includes(query)
    );
  });

  selectConversation(conversation: Conversation) {
    this.selectedConversationId.set(conversation.id);

    const currentList = this.conversationsList();
    const updatedList = currentList.map((c) =>
      c.id === conversation.id ? { ...c, unreadCount: 0 } : c
    );
    this.conversationsList.set(updatedList);

    this.fetchMessages(conversation.id);
    this.scheduleScroll(200);

    if (this.wsService.isConnected()) {
      setTimeout(() => {
        const activeChat = this.activeChat();
        const messages = activeChat?.messages || [];
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && !lastMessage.isOwn) {
          this.wsService.markAsRead(conversation.id, lastMessage.id);
        }
      }, 1000);
    }
  }

  sendMessage() {
    const conversationId = this.selectedConversationId();
    if (!this.messageInput.trim() || !conversationId) {
      return;
    }

    const content = this.messageInput.trim();
    this.messageInput = '';

    const conversations = this.conversations();
    const conversation = conversations.find((c) => c.id === conversationId);
    if (!conversation) {
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user',
      senderName: 'You',
      content,
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
      isDelivered: false, // Optimistic, not yet delivered
      isRead: false,
    };

    // Update local messages optimistically
    const currentMessages = this.localMessages();
    if (!currentMessages[conversationId]) {
      currentMessages[conversationId] = [];
    }
    currentMessages[conversationId].push(newMessage);
    this.localMessages.set({ ...currentMessages });

    this.scheduleScroll(50);

    // Update conversation list immediately
    const currentList = this.conversationsList();
    const updatedList = currentList.map((c) =>
      c.id === conversationId ? { ...c, lastMessage: content, timestamp: 'Just now' } : c
    );
    this.conversationsList.set(updatedList);

    // Send via REST API (backend will broadcast via WebSocket)
    this.sendMessageMutation.mutate({
      conversationId,
      content,
    });
  }

  handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'message':
        if (message.conversationId && message.content) {
          const currentUserId = this.authService.getUserId();
          const isOwnMessage = message.senderId === currentUserId;

          const newMessage: ChatMessage = {
            id: message.messageId || Date.now().toString(),
            senderId: message.senderId || '',
            senderName: message.senderName || '',
            content: message.content,
            timestamp: message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
            isOwn: isOwnMessage,
            isDelivered: true, // Messages from WebSocket are delivered
            isRead: false, // Will be updated via read_receipt
          };

          // Always update local messages for all conversations
          const currentMessages = this.localMessages();
          if (!currentMessages[message.conversationId]) {
            currentMessages[message.conversationId] = [];
          }

          // For own messages, check if we have an optimistic message with the same content
          // and replace it instead of adding a duplicate
          if (isOwnMessage) {
            // Find optimistic message (one that was just added optimistically)
            // Optimistic messages have numeric IDs (Date.now()) and match content
            const optimisticIndex = currentMessages[message.conversationId].findIndex(
              (m) => m.isOwn && m.content === message.content && /^\d+$/.test(m.id) // Optimistic messages have numeric IDs
            );
            if (optimisticIndex !== -1) {
              // Replace optimistic message with real one from server
              // Preserve read status if it was already set
              const existingMessage = currentMessages[message.conversationId][optimisticIndex];
              currentMessages[message.conversationId][optimisticIndex] = {
                ...newMessage,
                isDelivered: true,
                isRead: existingMessage.isRead || false,
              };
              this.localMessages.set({ ...currentMessages });
            } else {
              // Check if message already exists by ID (avoid duplicates)
              const existingIndex = currentMessages[message.conversationId].findIndex(
                (m) => m.id === newMessage.id
              );
              if (existingIndex === -1) {
                currentMessages[message.conversationId].push(newMessage);
                this.localMessages.set({ ...currentMessages });
                if (message.conversationId === this.selectedConversationId()) {
                  this.scheduleScroll(50);
                }
              }
            }
          } else {
            // For messages from others, check if message already exists by ID
            const existingIndex = currentMessages[message.conversationId].findIndex(
              (m) => m.id === newMessage.id
            );
            if (existingIndex === -1) {
              currentMessages[message.conversationId].push(newMessage);
              this.localMessages.set({ ...currentMessages });
              if (message.conversationId === this.selectedConversationId()) {
                this.scheduleScroll(50);
              }
            }
          }

          // Update conversation list with new last message
          const currentList = this.conversationsList();
          const conversation = currentList.find((c) => c.id === message.conversationId);
          if (conversation) {
            const updatedList = currentList.map((c) =>
              c.id === message.conversationId
                ? {
                    ...c,
                    lastMessage: message.content || c.lastMessage,
                    timestamp: 'Just now',
                    unreadCount:
                      message.conversationId === this.selectedConversationId()
                        ? c.unreadCount
                        : c.unreadCount + 1,
                  }
                : c
            );
            this.conversationsList.set(updatedList);
          }

          // If this is the selected conversation, also update messagesData
          // But only if it's not an own message (own messages are already in messagesData from API)
          if (message.conversationId === this.selectedConversationId() && !isOwnMessage) {
            const currentMessagesData = this.messagesData();
            if (currentMessagesData) {
              const exists = currentMessagesData.some((m) => m.id === newMessage.id);
              if (!exists) {
                const updatedMessagesData = [
                  ...currentMessagesData,
                  {
                    id: newMessage.id,
                    senderId: newMessage.senderId,
                    senderName: newMessage.senderName,
                    content: newMessage.content,
                    timestamp: newMessage.timestamp,
                    isOwn: newMessage.isOwn,
                  } as MessageResponse,
                ];
                this.messagesData.set(updatedMessagesData);
              }
            }
          }
        }

        // Refetch conversations to get updated unread counts
        this.conversationsQuery.refetch();
        break;

      case 'online':
        if (message.userId) {
          const currentList = this.conversationsList();
          const updatedList = currentList.map((c) =>
            c.userId === message.userId ? { ...c, isOnline: true } : c
          );
          this.conversationsList.set(updatedList);
        }
        break;

      case 'offline':
        if (message.userId) {
          const currentList = this.conversationsList();
          const updatedList = currentList.map((c) =>
            c.userId === message.userId ? { ...c, isOnline: false } : c
          );
          this.conversationsList.set(updatedList);
        }
        break;

      case 'typing':
        // Typing indicator is handled by WebSocketService
        break;

      case 'read_receipt':
        if (message.conversationId && message.messageId) {
          // Update message read status in local messages
          const currentMessages = this.localMessages();
          if (currentMessages[message.conversationId]) {
            const messageIndex = currentMessages[message.conversationId].findIndex(
              (m) => m.id === message.messageId
            );
            if (messageIndex !== -1) {
              currentMessages[message.conversationId][messageIndex] = {
                ...currentMessages[message.conversationId][messageIndex],
                isRead: true,
              };
              this.localMessages.set({ ...currentMessages });
            }
          }

          // Update messagesData if this conversation is selected
          if (message.conversationId === this.selectedConversationId()) {
            const currentMessagesData = this.messagesData();
            if (currentMessagesData) {
              const updatedMessagesData = currentMessagesData.map((m) =>
                m.id === message.messageId ? { ...m, isRead: true } : m
              );
              this.messagesData.set(updatedMessagesData);
            }
          }
        }
        break;
    }
  }

  ngAfterViewChecked() {
    // This lifecycle hook is kept for potential future use
    // Scroll is now handled via scheduleScroll method
  }

  private scheduleScroll(delay: number = 100) {
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    this.scrollTimeoutId = window.setTimeout(() => {
      this.scrollToBottom();
      this.scrollTimeoutId = undefined;
    }, delay);
  }

  private scrollToBottom() {
    if (!this.chatMessagesContainer) {
      return;
    }

    const container = this.chatMessagesContainer.nativeElement;
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      setTimeout(() => {
        if (container.scrollTop < container.scrollHeight - container.clientHeight - 10) {
          container.scrollTop = container.scrollHeight;
        }
      }, 50);
    });
  }

  ngOnDestroy() {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    if (this.scrollTimeoutId) {
      clearTimeout(this.scrollTimeoutId);
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  private typingTimeout?: number;

  onMessageInput() {
    const conversationId = this.selectedConversationId();
    if (!conversationId || !this.wsService.isConnected()) {
      return;
    }

    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    this.wsService.sendTypingIndicator(conversationId, true);

    this.typingTimeout = window.setTimeout(() => {
      this.wsService.sendTypingIndicator(conversationId, false);
      this.typingTimeout = undefined;
    }, 2000);
  }

  sendQuickReply(reply: string) {
    this.messageInput = reply;
    this.sendMessage();
  }

  toggleDriverMode() {
    this.isDriverMode = !this.isDriverMode;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
