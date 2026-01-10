import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Message, Conversation } from "../../types/entities";

interface ChatState {
  activeConversation: Conversation | null;
  messages: Message[];
  conversations: Record<string, Conversation>;
  onlineUsers: string[];
  typingStatus: Record<string, Record<string, boolean>>;
}

const initialState: ChatState = {
  activeConversation: null,
  messages: [],
  conversations: {},
  onlineUsers: [],
  typingStatus: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<Conversation>) => {
      state.activeConversation = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const newConvo = action.payload;
      state.conversations[newConvo._id] = {
        ...newConvo,
        lastLocalActivityAt: newConvo.updatedAt,
      };
      if (state.activeConversation && state.activeConversation._id === newConvo._id) {
        state.activeConversation = state.conversations[newConvo._id];
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      if (
        state.activeConversation &&
        message.conversationId === state.activeConversation._id
      ) {
        const messageExists = state.messages.some((msg) => msg._id === message._id);
        if (!messageExists) {
          state.messages.push(message);
        }
      }
    },
    updateConversationsWithLatestMessage: (state, action: PayloadAction<Message>) => {
      const newLastMessage = action.payload;
      const conversationId = newLastMessage.conversationId;

      if (state.conversations[conversationId]) {
        state.conversations[conversationId].lastMessage = newLastMessage;
        state.conversations[conversationId].lastLocalActivityAt = newLastMessage.updatedAt;
        
        if (state.activeConversation && state.activeConversation._id === conversationId) {
          state.activeConversation.lastMessage = newLastMessage;
        }
      }
    },
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      const conversationsObj: Record<string, Conversation> = {};
      action.payload.forEach((convo) => {
        conversationsObj[convo._id] = {
          ...convo,
          lastLocalActivityAt: convo.updatedAt,
        };
      });
      state.conversations = conversationsObj;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    updateMessageDeliveredStatus: (state, action: PayloadAction<{ messageId: string; userId: string }>) => {
      const { messageId, userId } = action.payload;
      const message = state.messages.find((m) => m._id === messageId);
      
      if (message && !message.deliveredTo.some(user => 
        (typeof user === 'string' ? user : user._id) === userId
      )) {
        message.deliveredTo.push(userId);
      }

      Object.values(state.conversations).forEach(conv => {
        if (conv.lastMessage && conv.lastMessage._id === messageId) {
          if (!conv.lastMessage.deliveredTo.some(user => 
            (typeof user === 'string' ? user : user._id) === userId
          )) {
            conv.lastMessage.deliveredTo.push(userId);
          }
        }
      });
    },
    updateMessageSeenStatus: (state, action: PayloadAction<{ messageId: string; userId: string }>) => {
      const { messageId, userId } = action.payload;
      const message = state.messages.find((m) => m._id === messageId);
      
      if (message && !message.seenBy.some(user => 
        (typeof user === 'string' ? user : user._id) === userId
      )) {
        message.seenBy.push(userId);
      }

      Object.values(state.conversations).forEach(conv => {
        if (conv.lastMessage && conv.lastMessage._id === messageId) {
          if (!conv.lastMessage.seenBy.some(user => 
            (typeof user === 'string' ? user : user._id) === userId
          )) {
            conv.lastMessage.seenBy.push(userId);
          }
        }
      });
    },
    updateConversationMessagesSeenStatus: (state, action: PayloadAction<{ 
      conversationId: string; 
      userId: string 
    }>) => {
      const { conversationId, userId } = action.payload;
      state.messages.forEach((msg) => {
        if (
          msg.conversationId === conversationId &&
          !msg.seenBy.some(user => (typeof user === 'string' ? user : user._id) === userId)
        ) {
          msg.seenBy.push(userId);
        }
      });

      if (state.conversations[conversationId]?.lastMessage) {
        const lastMsg = state.conversations[conversationId].lastMessage!;
        if (!lastMsg.seenBy.some(user => (typeof user === 'string' ? user : user._id) === userId)) {
          lastMsg.seenBy.push(userId);
        }
      }
    },
    markConversationMessagesAsSeen: (state, action: PayloadAction<{ 
      conversationId: string; 
      userId: string 
    }>) => {
      const { conversationId, userId } = action.payload;
      state.messages.forEach((msg) => {
        if (
          msg.conversationId === conversationId &&
          msg.sender._id !== userId &&
          !msg.seenBy.some(user => (typeof user === 'string' ? user : user._id) === userId)
        ) {
          msg.seenBy.push(userId);
        }
      });
    },
    setTypingStatus: (state, action: PayloadAction<{ 
      conversationId: string; 
      userId: string; 
      isTyping: boolean 
    }>) => {
      const { conversationId, userId, isTyping } = action.payload;

      if (!state.typingStatus[conversationId]) {
        state.typingStatus[conversationId] = {};
      }

      if (isTyping) {
        state.typingStatus[conversationId][userId] = true;
      } else {
        delete state.typingStatus[conversationId][userId];
        if (Object.keys(state.typingStatus[conversationId]).length === 0) {
          delete state.typingStatus[conversationId];
        }
      }
    },
    releaseChatInfo: () => initialState,
    closeChat: (state) => {
      state.messages = [];
      state.activeConversation = null;
    },
  },
});

export const {
  setActiveConversation,
  addConversation,
  setMessages,
  addMessage,
  updateConversationsWithLatestMessage,
  setConversations,
  clearMessages,
  setOnlineUsers,
  setTypingStatus,
  updateMessageDeliveredStatus,
  updateMessageSeenStatus,
  updateConversationMessagesSeenStatus,
  markConversationMessagesAsSeen,
  releaseChatInfo,
  closeChat,
} = chatSlice.actions;
export default chatSlice.reducer;