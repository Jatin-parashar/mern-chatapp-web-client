import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { 
  CreateConversationRequest, 
  SendMessageRequest, 
  MessageResponse, 
  ConversationResponse 
} from "../../types/api";

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    createConversation: builder.mutation<ConversationResponse, { 
      conversationInfo: CreateConversationRequest; 
      isGroup?: boolean 
    }>({
      query: ({ conversationInfo, isGroup = false }) => ({
        url: `conversation?isGroup=${isGroup}`,
        method: "POST",
        body: conversationInfo,
      }),
    }),
    getUserConversations: builder.query<ConversationResponse, void>({
      query: () => "conversation",
    }),
    getConversationById: builder.query<ConversationResponse, string>({
      query: (id) => `conversation/${id}`,
    }),
    sendMessage: builder.mutation<MessageResponse, SendMessageRequest>({
      query: (messageInfo) => ({
        url: "message",
        method: "POST",
        body: messageInfo,
      }),
    }),
    getMessagesByConversation: builder.query<MessageResponse, { 
      id: string; 
      limit?: number; 
      skip?: number 
    }>({
      query: ({ id, limit = 50, skip = 0 }) => 
        `message/conversation/${id}?limit=${limit}&skip=${skip}`,
    }),
    markConversationMessagesSeen: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `message/seen/conversation/${id}`,
        method: "PATCH",
      }),
    }),
    markMessageSeen: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `message/seen/${id}`,
        method: "PATCH",
      }),
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetConversationByIdQuery,
  useGetMessagesByConversationQuery,
  useGetUserConversationsQuery,
  useMarkMessageSeenMutation,
  useMarkConversationMessagesSeenMutation,
  useSendMessageMutation,
  useLazyGetConversationByIdQuery,
  useLazyGetMessagesByConversationQuery,
  useLazyGetUserConversationsQuery,
} = chatApi;
