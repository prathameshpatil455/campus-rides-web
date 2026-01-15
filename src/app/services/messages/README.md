# Messages Service Architecture

## Overview

This service implements a **hybrid approach** combining REST APIs and WebSockets for optimal messaging functionality.

## Architecture

```
┌─────────────────┐
│  Messages UI    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│  REST  │ │  WebSocket   │
│  APIs  │ │   Service    │
└────────┘ └──────────────┘
    │              │
    └──────┬───────┘
           ▼
    ┌─────────────┐
    │   Backend   │
    │   Service   │
    └─────────────┘
```

## When to Use What

### REST APIs (Initial Load & History)

- ✅ Fetch conversation list on page load
- ✅ Load message history for a conversation
- ✅ Send messages (fallback if WebSocket fails)
- ✅ Mark messages as read
- ✅ Search conversations

### WebSocket (Real-time Updates)

- ✅ Receive new messages instantly
- ✅ Online/offline status updates
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Real-time message delivery

## Integration Example

```typescript
// In messages.component.ts
export class Messages {
  private wsService = inject(WebSocketService);
  private conversationsQuery = useGetConversations();
  private sendMessageMutation = useSendMessage();

  ngOnInit() {
    // Connect WebSocket on component init
    this.wsService.connect();

    // Subscribe to WebSocket messages
    this.wsService.getMessages().subscribe((message) => {
      this.handleWebSocketMessage(message);
    });
  }

  handleWebSocketMessage(message: WebSocketMessage) {
    switch (message.type) {
      case 'message':
        // Add new message to active chat
        if (this.activeChat?.userId === message.senderId) {
          this.activeChat.messages.push({
            id: message.messageId!,
            senderId: message.senderId!,
            content: message.content!,
            timestamp: message.timestamp!,
            isOwn: false,
          });
        }
        // Update conversation list
        this.conversationsQuery.refetch();
        break;

      case 'typing':
        // Show typing indicator
        break;

      case 'online':
      case 'offline':
        // Update user online status
        break;
    }
  }

  sendMessage() {
    // Try WebSocket first (faster)
    if (this.wsService.isConnected()) {
      this.wsService.sendMessage(this.activeChat!.userId, this.messageInput);
    } else {
      // Fallback to REST API
      this.sendMessageMutation.mutate({
        conversationId: this.activeChat!.userId,
        content: this.messageInput,
      });
    }
  }

  ngOnDestroy() {
    // Disconnect when leaving page (optional - can keep connected)
    // this.wsService.disconnect();
  }
}
```

## Backend Requirements

Your backend needs to support:

1. **WebSocket Endpoint**: `ws://localhost:3000/messages/ws?token=<jwt>`
2. **REST Endpoints**:
   - `GET /api/messages/conversations` - Get all conversations
   - `GET /api/messages/conversations/:id/messages` - Get messages
   - `POST /api/messages/send` - Send message

**📖 For detailed backend setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)**

## WebSocket Message Format

```typescript
// Client → Server
{
  type: 'message',
  conversationId: 'user-123',
  content: 'Hello!',
  timestamp: '2024-12-02T10:30:00Z'
}

// Server → Client
{
  type: 'message',
  conversationId: 'user-123',
  senderId: 'user-456',
  content: 'Hi there!',
  timestamp: '2024-12-02T10:30:05Z',
  messageId: 'msg-789'
}
```

## Benefits of This Approach

1. **Best of Both Worlds**: REST for reliability, WebSocket for real-time
2. **Graceful Degradation**: Falls back to REST if WebSocket fails
3. **Efficient**: Only WebSocket for real-time, REST for initial loads
4. **Scalable**: Can handle high message volumes
