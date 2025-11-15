export type CallStatus = "idle" | "calling" | "ringing" | "connecting" | "connected" | "ended";
export type MessageType = "text" | "image" | "video" | "audio" | "document" | "system";
export type UserStatus = "online" | "offline" | "away" | "busy";

export interface PaginationParams {
  limit?: number;
  skip?: number;
  page?: number;
}

export interface IncomingCall {
  callId: string;
  callerInfo: {
    _id: string;
    name: string;
    username: string;
    profilePic?: string;
  };
  isVideoCall: boolean;
  signal?: any;
}

export interface CallSignalData {
  callId: string;
  signal: any;
}