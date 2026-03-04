export interface User {
  _id: string;
  name: string;
  username: string;
  status: string;
  profilePic: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content?: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'document' | 'file';
  deliveredTo: (string | User)[];
  seenBy: (string | User)[];
  attachments?: MessageAttachment[];
  replyTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageAttachment {
  url: string;
  publicId: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface Conversation {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  admins?: User[];
  lastMessage?: Message;
  lastLocalActivityAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  _id: string;
  callId: string;
  caller: User;
  receiver: User;
  isVideoCall: boolean;
  status: 'calling' | 'accepted' | 'declined' | 'ended' | 'missed';
  duration: number;
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}
