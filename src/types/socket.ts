import type { Message, Conversation } from "./entities";

// Presence events
export interface SetupEventData {
  userId: string;
}

export interface OnlineUsersEventData {
  users: string[];
}

// Chat events
export interface JoinRoomEventData {
  roomId: string;
}

export interface NewMessageEventData {
  message: Message;
  userId: string;
}

export interface MessageReceivedEventData {
  message: Message;
}

export interface NewConversationEventData {
  conversationId: string;
  userId: string;
}

export interface ConversationReceivedEventData {
  conversation: Conversation;
}

export interface MessageSeenEventData {
  conversationId: string;
  messageId: string;
  userId: string;
}

export interface MessageSeenUpdateEventData {
  conversationId: string;
  messageId: string;
  userId: string;
}

export interface ConversationMessagesSeenEventData {
  conversationId: string;
  userId: string;
}

export interface ConversationMessagesSeenUpdateEventData {
  conversationId: string;
  userId: string;
}

// Typing events
export interface TypingEventData {
  conversationId: string;
  userId: string;
}

export interface StopTypingEventData {
  conversationId: string;
  userId: string;
}

// Call events
export interface CallInitiatedEventData {
  callId: string;
  receiverId: string;
  callerInfo: {
    _id: string;
    name: string;
    username: string;
    profilePic?: string;
  };
  isVideoCall: boolean;
  signal: RTCSessionDescriptionInit;
}

export interface CallReceivedEventData {
  callId: string;
  callerInfo: {
    _id: string;
    name: string;
    username: string;
    profilePic?: string;
  };
  isVideoCall: boolean;
  signal: RTCSessionDescriptionInit;
}

export interface CallAcceptedEventData {
  callId: string;
  signal: RTCSessionDescriptionInit;
}

export interface CallDeclinedEventData {
  callId: string;
  reason?: string;
}

export interface CallEndedEventData {
  callId: string;
}

export interface CallSignalEventData {
  callId: string;
  signal: RTCSessionDescriptionInit | RTCIceCandidateInit;
}

export interface CallPeerDisconnectedEventData {
  callId: string;
}