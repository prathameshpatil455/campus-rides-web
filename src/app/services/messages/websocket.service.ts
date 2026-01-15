import { Injectable } from '@angular/core';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'online' | 'offline' | 'read_receipt' | 'error';
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  content?: string;
  timestamp?: string;
  userId?: string;
  isTyping?: boolean;
  messageId?: string;
  readBy?: string;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private connectionStatus$ = new BehaviorSubject<'connected' | 'disconnected' | 'connecting'>(
    'disconnected'
  );
  private messages$ = new Subject<WebSocketMessage>();
  private typingUsers$ = new BehaviorSubject<Record<string, boolean>>({});

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket && this.socket.connected) {
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      console.warn(
        'Cannot connect: No authentication token. WebSocket will not connect until user is logged in.'
      );
      return;
    }

    const baseUrl = environment.apiBaseUrl.replace('/api', '');
    this.connectionStatus$.next('connecting');

    try {
      this.socket = io(baseUrl, {
        path: '/messages/ws',
        auth: {
          token: token,
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0;
        this.connectionStatus$.next('connected');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
        this.connectionStatus$.next('disconnected');
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        this.connectionStatus$.next('disconnected');
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.warn(
            'Max reconnection attempts reached. WebSocket will not reconnect. This is normal if the backend is not running.'
          );
        }
      });

      this.socket.on('message', (data: WebSocketMessage) => {
        this.messages$.next({
          type: 'message',
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          content: data.content,
          timestamp: data.timestamp,
          messageId: data.messageId,
        });
      });

      this.socket.on('online', (data: { userId: string }) => {
        this.messages$.next({
          type: 'online',
          userId: data.userId,
        });
      });

      this.socket.on('offline', (data: { userId: string }) => {
        this.messages$.next({
          type: 'offline',
          userId: data.userId,
        });
      });

      this.socket.on(
        'typing',
        (data: { conversationId: string; userId: string; isTyping: boolean }) => {
          const typingUsers = this.typingUsers$.value;
          if (data.isTyping) {
            typingUsers[data.conversationId] = true;
          } else {
            delete typingUsers[data.conversationId];
          }
          this.typingUsers$.next({ ...typingUsers });

          this.messages$.next({
            type: 'typing',
            conversationId: data.conversationId,
            userId: data.userId,
            isTyping: data.isTyping,
          });
        }
      );

      this.socket.on(
        'read_receipt',
        (data: { conversationId: string; messageId: string; readBy: string }) => {
          this.messages$.next({
            type: 'read_receipt',
            conversationId: data.conversationId,
            messageId: data.messageId,
            readBy: data.readBy,
          });
        }
      );
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionStatus$.next('disconnected');
    }
  }

  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('typing', {
      conversationId,
      isTyping,
    });
  }

  markAsRead(conversationId: string, messageId: string): void {
    if (!this.socket || !this.socket.connected) {
      return;
    }

    this.socket.emit('read_receipt', {
      conversationId,
      messageId,
    });
  }

  getMessages(): Observable<WebSocketMessage> {
    return this.messages$.asObservable();
  }

  getConnectionStatus(): Observable<'connected' | 'disconnected' | 'connecting'> {
    return this.connectionStatus$.asObservable();
  }

  getTypingUsers(): Observable<Record<string, boolean>> {
    return this.typingUsers$.asObservable();
  }

  isTyping(conversationId: string): boolean {
    return this.typingUsers$.value[conversationId] || false;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus$.next('disconnected');
      this.reconnectAttempts = 0;
      this.typingUsers$.next({});
    }
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }
}
