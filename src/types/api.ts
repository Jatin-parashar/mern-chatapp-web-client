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

export interface UserData {
  user?: User;
  users?: User[];
  updatedUser?: User;
}

export interface UserResponse extends ApiResponse<UserData> {}

// CONVERSATION API (matches conversation.controller.ts)
export interface CreateConversationRequest {
  participants: string[];
  name?: string;
}

export interface ConversationData {
  conversation?: Conversation;
  conversations?: Conversation[];
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

export interface MessageData {
  message?: Message;
  messages?: Message[];
  count?: number;
  total?: number;
}

export interface MessageResponse extends ApiResponse<MessageData> {}

// CALL API (matches call.controller.ts)
export interface CallData {
  call?: Call;
  calls?: Call[];
  count?: number;
}

export interface CallHistoryResponse extends ApiResponse<CallData> {}
export interface CallDetailsResponse extends ApiResponse<CallData> {}

// API Error
export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}