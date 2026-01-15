# Messaging API Documentation

Complete guide for integrating messaging functionality (HTTP APIs and WebSocket) into the frontend application.

---

## 📋 Table of Contents

1. [HTTP API Endpoints](#http-api-endpoints)
2. [WebSocket Connection](#websocket-connection)
3. [Real-time Events](#real-time-events)
4. [Online/Offline Status](#onlineoffline-status)
5. [Typing Indicators](#typing-indicators)
6. [Error Handling](#error-handling)
7. [Example Implementation](#example-implementation)

---

## 🌐 HTTP API Endpoints

**Base URL:** `http://localhost:3000/api` (or your production URL)  
**All endpoints require authentication** - Include JWT token in `Authorization` header.

### 1. Get All Conversations

Get all active conversations for the authenticated user.

```http
GET /api/messages/conversations
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "67890abcdef1234567890123",
      "userId": "695c96af52568f46aa59b2e6",
      "userName": "John Doe",
      "userInitials": "JD",
      "lastMessage": "Hello! How are you?",
      "route": "Main Gate → Engineering Block",
      "timestamp": "Just now",
      "unreadCount": 2,
      "isOnline": true
    }
  ]
}
```

**Response Fields:**
- `id`: Conversation ID (use this for getting messages and sending messages)
- `userId`: Other user's ID in the conversation
- `userName`: Full name of the other user
- `userInitials`: Initials for avatar display
- `lastMessage`: Last message content in the conversation
- `route`: Ride route (pickup → destination)
- `timestamp`: Formatted timestamp ("Just now", "5 minutes ago", "Yesterday", etc.)
- `unreadCount`: Number of unread messages
- `isOnline`: Boolean indicating if the other user is currently online

---

### 2. Get Messages for a Conversation

Get all messages in a specific conversation.

```http
GET /api/messages/conversations/:conversationId/messages
Authorization: Bearer <jwt-token>
```

**Example:**
```http
GET /api/messages/conversations/67890abcdef1234567890123/messages
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg-123",
      "senderId": "695c96af52568f46aa59b2e6",
      "senderName": "John Doe",
      "content": "Hi! Are you available for a ride tomorrow?",
      "timestamp": "10:30 AM",
      "isOwn": false
    },
    {
      "id": "msg-124",
      "senderId": "your-user-id",
      "senderName": "Your Name",
      "content": "Yes, I am available. What time do you need?",
      "timestamp": "10:32 AM",
      "isOwn": true
    }
  ]
}
```

**Response Fields:**
- `id`: Message ID
- `senderId`: ID of the user who sent the message
- `senderName`: Full name of the sender
- `content`: Message content
- `timestamp`: Formatted time (e.g., "10:30 AM")
- `isOwn`: Boolean indicating if the message was sent by the current user

**Note:** Calling this endpoint automatically resets the unread count for the conversation.

---

### 3. Send a Message

Send a message to a conversation.

```http
POST /api/messages/send
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "conversationId": "67890abcdef1234567890123",
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new-message-id",
    "conversationId": "67890abcdef1234567890123",
    "content": "Hello, how are you?",
    "timestamp": "2024-12-02T10:30:00.000Z"
  }
}
```

**Important:** 
- When you send a message via this endpoint, the server automatically emits it via WebSocket to the recipient (if online) and back to the sender
- You don't need to manually emit via WebSocket - the HTTP endpoint handles real-time delivery

---

## 🔌 WebSocket Connection

### Connection Setup

**WebSocket URL:** `ws://localhost:3000/messages/ws` (or `wss://` for production)

**Authentication:** Pass JWT token as query parameter or in auth object.

**Using Socket.io Client:**

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  path: '/messages/ws',
  auth: {
    token: 'your-jwt-token-here'
  },
  // Alternative: use query parameter
  // query: { token: 'your-jwt-token-here' }
});

socket.on('connect', () => {
  console.log('✅ Connected to WebSocket');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from WebSocket');
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

## 📡 Real-time Events

### Events You Can Listen To (Server → Client)

#### 1. New Message

Emitted when a new message is received in a conversation you're part of.

```javascript
socket.on('message', (data) => {
  console.log('New message:', data);
});
```

**Event Data:**
```json
{
  "type": "message",
  "conversationId": "67890abcdef1234567890123",
  "senderId": "695c96af52568f46aa59b2e6",
  "senderName": "John Doe",
  "content": "Hello!",
  "timestamp": "2024-12-02T10:30:00.000Z",
  "messageId": "msg-789"
}
```

**Usage:** Append this message to your conversation view in real-time.

---

#### 2. Online Status

Emitted when a user comes online.

```javascript
socket.on('online', (data) => {
  console.log('User came online:', data);
});
```

**Event Data:**
```json
{
  "type": "online",
  "userId": "695c96af52568f46aa59b2e6"
}
```

**Usage:** Update the `isOnline` status in your conversations list for this user.

---

#### 3. Offline Status

Emitted when a user goes offline.

```javascript
socket.on('offline', (data) => {
  console.log('User went offline:', data);
});
```

**Event Data:**
```json
{
  "type": "offline",
  "userId": "695c96af52568f46aa59b2e6"
}
```

**Usage:** Update the `isOnline` status to `false` in your conversations list for this user.

---

#### 4. Typing Indicator

Emitted when the other user is typing in a conversation.

```javascript
socket.on('typing', (data) => {
  console.log('User typing:', data);
});
```

**Event Data:**
```json
{
  "type": "typing",
  "conversationId": "67890abcdef1234567890123",
  "userId": "695c96af52568f46aa59b2e6",
  "isTyping": true
}
```

**Usage:** Show/hide typing indicator in the conversation UI.

---

#### 5. Read Receipt

Emitted when a message is read by the recipient.

```javascript
socket.on('read_receipt', (data) => {
  console.log('Message read:', data);
});
```

**Event Data:**
```json
{
  "type": "read_receipt",
  "conversationId": "67890abcdef1234567890123",
  "messageId": "msg-789",
  "readBy": "695c96af52568f46aa59b2e6"
}
```

**Usage:** Update message status (e.g., show double checkmark) when message is read.

---

### Events You Can Emit (Client → Server)

#### 1. Typing Indicator

Emit when the user starts/stops typing.

```javascript
socket.emit('typing', {
  conversationId: '67890abcdef1234567890123',
  isTyping: true  // or false when stopped typing
});
```

**Best Practice:** 
- Emit `isTyping: true` when user starts typing
- Emit `isTyping: false` when user stops typing (after a delay, e.g., 1-2 seconds of no input)
- Only emit when user is actively typing in the input field

---

#### 2. Read Receipt

Emit when the user reads/view messages in a conversation.

```javascript
socket.emit('read_receipt', {
  conversationId: '67890abcdef1234567890123',
  messageId: 'msg-789'
});
```

**Usage:** Emit this when the user opens/view messages in a conversation to mark them as read.

---

## 🟢 Online/Offline Status

### How It Works

1. **Initial Status:** When you fetch conversations via `GET /api/messages/conversations`, each conversation includes an `isOnline` field indicating if the other user is currently online.

2. **Real-time Updates:** 
   - Listen to `online` events to update status when users come online
   - Listen to `offline` events to update status when users go offline
   - Update your local state/conversations list accordingly

### Implementation Example

```javascript
// Fetch conversations on mount
const conversations = await fetchConversations();
// Each conversation has isOnline: true/false

// Listen for real-time status updates
socket.on('online', (data) => {
  // Update conversation where userId matches data.userId
  updateConversationStatus(data.userId, { isOnline: true });
});

socket.on('offline', (data) => {
  // Update conversation where userId matches data.userId
  updateConversationStatus(data.userId, { isOnline: false });
});
```

---

## ⌨️ Typing Indicators

### How to Implement

1. **When User Types:** Emit typing event when user starts typing
2. **When User Stops:** Emit typing event with `isTyping: false` after a delay
3. **Display Indicator:** Show typing indicator when receiving typing event from other user

### Example Implementation

```javascript
let typingTimeout;

// When user types in input field
function handleInputChange(conversationId, value) {
  // Clear previous timeout
  clearTimeout(typingTimeout);
  
  // Emit typing started
  socket.emit('typing', {
    conversationId: conversationId,
    isTyping: true
  });
  
  // Set timeout to stop typing after 2 seconds of no input
  typingTimeout = setTimeout(() => {
    socket.emit('typing', {
      conversationId: conversationId,
      isTyping: false
    });
  }, 2000);
}

// Listen for typing from other users
socket.on('typing', (data) => {
  if (data.isTyping) {
    showTypingIndicator(data.conversationId, data.userId);
  } else {
    hideTypingIndicator(data.conversationId, data.userId);
  }
});
```

---

## ⚠️ Error Handling

### HTTP API Errors

All endpoints return standard error responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Status Codes:**
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (access denied to conversation)
- `404`: Not Found (conversation/message not found)
- `500`: Internal Server Error

### WebSocket Errors

```javascript
socket.on('connect_error', (error) => {
  if (error.message === 'Authentication error: Invalid token') {
    // Handle authentication error - redirect to login
  } else if (error.message === 'Authentication error: User is blocked') {
    // Handle blocked user
  }
});
```

---

## 💡 Complete Example Implementation

```javascript
import { io } from 'socket.io-client';

class MessagingService {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.socket = null;
  }

  connect() {
    this.socket = io(this.baseUrl, {
      path: '/messages/ws',
      auth: { token: this.token }
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
    });

    this.socket.on('message', (data) => {
      this.handleNewMessage(data);
    });

    this.socket.on('online', (data) => {
      this.handleUserOnline(data.userId);
    });

    this.socket.on('offline', (data) => {
      this.handleUserOffline(data.userId);
    });

    this.socket.on('typing', (data) => {
      this.handleTyping(data);
    });

    this.socket.on('read_receipt', (data) => {
      this.handleReadReceipt(data);
    });
  }

  async getConversations() {
    const response = await fetch(`${this.baseUrl}/api/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async getMessages(conversationId) {
    const response = await fetch(
      `${this.baseUrl}/api/messages/conversations/${conversationId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );
    return response.json();
  }

  async sendMessage(conversationId, content) {
    const response = await fetch(`${this.baseUrl}/api/messages/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ conversationId, content })
    });
    return response.json();
  }

  emitTyping(conversationId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  emitReadReceipt(conversationId, messageId) {
    if (this.socket) {
      this.socket.emit('read_receipt', { conversationId, messageId });
    }
  }

  handleNewMessage(data) {
    // Add message to conversation UI
    console.log('New message:', data);
  }

  handleUserOnline(userId) {
    // Update user online status
    console.log('User online:', userId);
  }

  handleUserOffline(userId) {
    // Update user offline status
    console.log('User offline:', userId);
  }

  handleTyping(data) {
    // Show/hide typing indicator
    console.log('Typing:', data);
  }

  handleReadReceipt(data) {
    // Update message read status
    console.log('Read receipt:', data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Usage
const messagingService = new MessagingService(
  'http://localhost:3000',
  'your-jwt-token'
);

messagingService.connect();
```

---

## 📝 Notes

1. **Authentication:** All HTTP endpoints and WebSocket connection require a valid JWT token
2. **Sending Messages:** Use the HTTP POST endpoint - WebSocket emission is handled automatically
3. **Real-time Updates:** WebSocket events are for receiving real-time updates, not for sending messages
4. **Online Status:** Initial status comes from HTTP API, real-time updates via WebSocket
5. **Typing Indicators:** Emit typing events when user types, listen for typing events from others
6. **Read Receipts:** Emit read receipts when viewing messages, listen for read receipts from others

---

## 🔗 Environment Variables

For production, make sure to update:
- **HTTP API Base URL:** Use your production API URL
- **WebSocket URL:** Use `wss://` (secure WebSocket) in production
- **CORS:** Backend is configured to allow requests from `FRONTEND_URL` environment variable

---

## 🧪 Testing

To test the messaging functionality:

1. Run the seed script to create test data:
   ```bash
   npm run seed:conversation
   ```

2. Use the conversation ID returned by the seed script to test sending messages

3. Open two browser tabs/windows with different user accounts to test real-time messaging

