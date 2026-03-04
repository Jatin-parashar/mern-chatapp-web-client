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
  user: { _id: string; email: string };
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse extends ApiResponse<AuthData> {}

// USER API (matches user.controller.ts)
export interface UpdateUserRequest {
  status?: string;
}

// Updated to match server queryBuilder pagination format
export interface UserData {
  user?: User;
  data?: User[];  // Paginated results
  count?: number;  // Items in current page
  total?: number;  // Total items available
  hasMore?: boolean;  // Whether more pages exist
  updatedUser?: User;
  available?: boolean;  // For username availability check
}

export interface UserResponse extends ApiResponse<UserData> {}

// CONVERSATION API (matches conversation.controller.ts)
export interface CreateConversationRequest {
  participants: string[];
  name?: string;
}

// Updated to match server queryBuilder pagination format
export interface ConversationData {
  conversation?: Conversation;
  data?: Conversation[];  // Paginated results
  count?: number;  // Items in current page
  total?: number;  // Total items available
  hasMore?: boolean;  // Whether more pages exist
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

// Updated to match server queryBuilder pagination format
export interface MessageData {
  message?: Message;
  conversation?: Conversation;  // For first message response
  data?: Message[];  // Paginated results
  messages?: Message[];  // For cursor-based pagination
  nextCursor?: string | null;  // For cursor-based pagination
  count?: number;  // Items in current page
  total?: number;  // Total items available
  hasMore?: boolean;  // Whether more pages exist
}

export interface MessageResponse extends ApiResponse<MessageData> {}

// CALL API (matches call.controller.ts)
// Updated to match server queryBuilder pagination format
export interface CallData {
  call?: Call;
  data?: Call[];  // Paginated results
  count?: number;  // Items in current page
  total?: number;  // Total items available
  hasMore?: boolean;  // Whether more pages exist
}

export interface CallHistoryResponse extends ApiResponse<CallData> {}
export interface CallDetailsResponse extends ApiResponse<CallData> {}

// API Error
export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}