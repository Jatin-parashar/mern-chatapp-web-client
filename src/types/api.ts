import type { User, Message, Conversation, Call } from "./entities";

// Generic API Response (matches server response.ts)
export interface ApiResponse<T = unknown> {
  status: "success";
  message: string;
  data?: T;
}

// AUTH API (matches auth.controller.ts)
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  status?: string;
  profilePic?: File;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse extends ApiResponse<AuthData> {}

// USER API (matches user.controller.ts)
export interface UpdateUserRequest {
  status?: string;
}

// Updated to match new pagination format
export interface UserData {
  user?: User;
  data?: User[];  // Changed from users to data
  count?: number;
  total?: number;
  hasMore?: boolean;
  updatedUser?: User;
}

export interface UserResponse extends ApiResponse<UserData> {}

// CONVERSATION API (matches conversation.controller.ts)
export interface CreateConversationRequest {
  participants: string[];
  name?: string;
}

// Updated to match new pagination format
export interface ConversationData {
  conversation?: Conversation;
  data?: Conversation[];  // Changed from conversations to data
  count?: number;
  total?: number;
  hasMore?: boolean;
}

export interface ConversationResponse extends ApiResponse<ConversationData> {}

// MESSAGE API (matches message.controller.ts)
export interface SendMessageRequest {
  conversationId: string;
  content?: string;
  attachments?: File[];
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'document';
  replyTo?: string;
}

// Updated to match new pagination format
export interface MessageData {
  message?: Message;
  data?: Message[];  // Changed from messages to data
  count?: number;
  total?: number;
  hasMore?: boolean;
}

export interface MessageResponse extends ApiResponse<MessageData> {}

// CALL API (matches call.controller.ts)
export interface CallData {
  call?: Call;
  data?: Call[];  // Changed from calls to data
  count?: number;
  total?: number;
  hasMore?: boolean;
}

export interface CallHistoryResponse extends ApiResponse<CallData> {}
export interface CallDetailsResponse extends ApiResponse<CallData> {}

// API Error
export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}