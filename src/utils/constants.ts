export const getServerURL = (path:string) => {
  return `${import.meta.env.VITE_SERVER_URL}/api/v1/${path}`;
};

export const socketURL = import.meta.env.VITE_SERVER_URL;

// TBD
// export const API_ENDPOINTS = {
//   AUTH: {
//     LOGIN: '/auth/login',
//     REGISTER: '/auth/register',
//     LOGOUT: '/auth/logout',
//     REFRESH: '/auth/refresh',
//   },
//   USER: {
//     PROFILE: '/user/profile',
//     SEARCH: '/user/search',
//     BY_ID: '/user',
//   },
//   CONVERSATION: {
//     LIST: '/conversation',
//     CREATE: '/conversation',
//   },
//   MESSAGE: {
//     LIST: '/message',
//     SEND: '/message',
//     READ: '/message',
//   },
//   CALL: {
//     INITIATE: '/call/initiate',
//     ACCEPT: '/call',
//     DECLINE: '/call',
//     END: '/call',
//     HISTORY: '/call/history',
//   },
// } as const;

// export const SOCKET_EVENTS = {
//   // Connection
//   CONNECT: 'connect',
//   DISCONNECT: 'disconnect',
  
//   // Setup
//   SETUP: 'setup',
//   JOIN_ROOM: 'joinRoom',
  
//   // Chat
//   NEW_MESSAGE: 'newMessage',
//   MESSAGE_RECEIVED: 'messageReceived',
//   NEW_CONVERSATION: 'newConversation',
//   CONVERSATION_RECEIVED: 'conversationReceived',
  
//   // Typing
//   TYPING: 'typing',
//   STOP_TYPING: 'stopTyping',
  
//   // Message Status
//   MESSAGE_SEEN: 'messageSeen',
//   MESSAGE_SEEN_UPDATE: 'messageSeenUpdate',
//   CONVERSATION_MESSAGES_SEEN: 'conversationMessageSeen',
//   CONVERSATION_MESSAGES_SEEN_UPDATE: 'conversationMessageSeenUpdate',
  
//   // Presence
//   ONLINE_USERS: 'onlineUsers',
  
//   // Calls
//   CALL_INITIATED: 'callInitiated',
//   CALL_RECEIVED: 'callReceived',
//   CALL_ACCEPTED: 'callAccepted',
//   CALL_DECLINED: 'callDeclined',
//   CALL_ENDED: 'callEnded',
//   CALL_SIGNAL: 'callSignal',
//   CALL_PEER_DISCONNECTED: 'callPeerDisconnected',
// } as const;

// export const MESSAGE_TYPES = {
//   TEXT: 'text',
//   IMAGE: 'image',
//   VIDEO: 'video',
//   AUDIO: 'audio',
//   DOCUMENT: 'document',
//   SYSTEM: 'system',
// } as const;

// export const CALL_STATUS = {
//   CALLING: 'calling',
//   ACCEPTED: 'accepted',
//   DECLINED: 'declined',
//   ENDED: 'ended',
//   MISSED: 'missed',
// } as const;