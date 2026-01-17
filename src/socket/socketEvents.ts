// Built-in events
export const SOCKET_CONNECT = "connect";
export const SOCKET_DISCONNECT = "disconnect";

// Presence events
export const SOCKET_SETUP = "setup";
export const SOCKET_ONLINE_USERS = "onlineUsers";

// Chat events
export const SOCKET_JOIN_ROOM = "joinRoom";
export const SOCKET_MESSAGE_RECEIVED = "messageReceived";
export const SOCKET_NEW_CONVERSATION_RECEIVED = "conversationReceived";

// Message status events
export const SOCKET_MESSAGE_DELIVERED_UPDATE = "messageDeliveredUpdate";
export const SOCKET_MESSAGE_SEEN_UPDATE = "messageSeenUpdate";
export const SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE = "conversationMessageSeenUpdate";

// Typing events
export const SOCKET_TYPING = "typing";
export const SOCKET_STOP_TYPING = "stopTyping";

// Call events
export const SOCKET_CALL_INITIATED = "callInitiated";
export const SOCKET_CALL_RECEIVED = "callReceived";
export const SOCKET_CALL_ACCEPTED = "callAccepted";
export const SOCKET_CALL_DECLINED = "callDeclined";
export const SOCKET_CALL_ENDED = "callEnded";
export const SOCKET_CALL_SIGNAL = "callSignal";
export const SOCKET_CALL_PEER_DISCONNECTED = "callPeerDisconnected";