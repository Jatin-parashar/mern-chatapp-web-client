import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  addMessage,
  addConversation,
  updateConversationsWithLatestMessage,
  updateMessageDeliveredStatus,
  updateMessageSeenStatus,
  updateConversationMessagesSeenStatus,
  markConversationMessagesAsSeen,
} from "../../features/chat/chatSlice";
import { useMarkMessageSeenMutation, useMarkConversationMessagesSeenMutation } from "../../features/chat/chatApi";
import { useSocketInstance } from "../SocketContext";
import { showMessageNotification } from "../../utils/notifications";
import {
  SOCKET_JOIN_ROOM,
  SOCKET_MESSAGE_RECEIVED,
  SOCKET_NEW_CONVERSATION_RECEIVED,
  SOCKET_MESSAGE_DELIVERED,
  SOCKET_MESSAGE_DELIVERED_UPDATE,
  SOCKET_BULK_MESSAGES_DELIVERED,
  SOCKET_MESSAGE_SEEN_UPDATE,
  SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE,
} from "../socketEvents";
import type {
  ConversationReceivedEventData,
  MessageDeliveredUpdateEventData,
  MessageSeenUpdateEventData,
  ConversationMessagesSeenUpdateEventData,
} from "../../types/socket";
import type { Message } from "../../types/entities";

export const useChat = () => {
  const { socket } = useSocketInstance();
  const dispatch = useDispatch();
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const currentUserId = useSelector((state: RootState) => state.user._id);
  
  const [markMessageSeen] = useMarkMessageSeenMutation();
  const [markConversationMessagesSeen] = useMarkConversationMessagesSeenMutation();
  
  // Track bulk-delivered messages to avoid redundant emissions
  const bulkDeliveredMessagesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = async (message: Message) => {
      dispatch(updateConversationsWithLatestMessage(message));

      // Emit delivery confirmation if not bulk-delivered
      if (message.sender._id !== currentUserId && !bulkDeliveredMessagesRef.current.has(message._id)) {
        socket.emit(SOCKET_MESSAGE_DELIVERED, { messageId: message._id });
      }

      if (activeConversation && activeConversation._id === message.conversationId) {
        dispatch(addMessage(message));

        if (message.sender._id !== currentUserId) {
          try {
            await markMessageSeen(message._id).unwrap();
            dispatch(updateMessageSeenStatus({ messageId: message._id, userId: currentUserId }));
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error("Failed to mark message as seen:", error);
            }
          }
        }
      } else if (message.sender._id !== currentUserId) {
        if (document.hidden) {
          showMessageNotification(
            message.sender.name,
            message.content || "Sent an attachment",
            message.sender.profilePic
          );
        }
      }
    };

    const handleConversationReceived = (data: ConversationReceivedEventData) => {
      dispatch(addConversation(data.conversation));
    };
    
    const handleBulkMessagesDelivered = ({ messageIds }: { messageIds: string[] }) => {
      // Store bulk-delivered message IDs to skip emitting for them
      messageIds.forEach(id => bulkDeliveredMessagesRef.current.add(id));
      
      // Clean up after 5 seconds to prevent memory leak
      setTimeout(() => {
        messageIds.forEach(id => bulkDeliveredMessagesRef.current.delete(id));
      }, 5000);
    };

    const handleMessageDeliveredUpdate = (data: MessageDeliveredUpdateEventData | { conversationId: string; messageIds: string[]; userId: string }) => {
      // Handle both single and bulk delivery updates
      if ('messageIds' in data) {
        // Bulk update
        data.messageIds.forEach(messageId => {
          dispatch(updateMessageDeliveredStatus({ messageId, userId: data.userId }));
        });
      } else {
        // Single update
        dispatch(updateMessageDeliveredStatus({ messageId: data.messageId, userId: data.userId }));
      }
    };

    const handleMessageSeenUpdate = ({ messageId, userId }: MessageSeenUpdateEventData) => {
      dispatch(updateMessageSeenStatus({ messageId, userId }));
    };

    const handleConversationMessagesSeenUpdate = ({
      conversationId,
      userId,
    }: ConversationMessagesSeenUpdateEventData) => {
      dispatch(updateConversationMessagesSeenStatus({ conversationId, userId }));
    };

    socket.on(SOCKET_MESSAGE_RECEIVED, handleMessageReceived);
    socket.on(SOCKET_NEW_CONVERSATION_RECEIVED, handleConversationReceived);
    socket.on(SOCKET_BULK_MESSAGES_DELIVERED, handleBulkMessagesDelivered);
    socket.on(SOCKET_MESSAGE_DELIVERED_UPDATE, handleMessageDeliveredUpdate);
    socket.on(SOCKET_MESSAGE_SEEN_UPDATE, handleMessageSeenUpdate);
    socket.on(SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE, handleConversationMessagesSeenUpdate);

    return () => {
      socket.off(SOCKET_MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(SOCKET_NEW_CONVERSATION_RECEIVED, handleConversationReceived);
      socket.off(SOCKET_BULK_MESSAGES_DELIVERED, handleBulkMessagesDelivered);
      socket.off(SOCKET_MESSAGE_DELIVERED_UPDATE, handleMessageDeliveredUpdate);
      socket.off(SOCKET_MESSAGE_SEEN_UPDATE, handleMessageSeenUpdate);
      socket.off(SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE, handleConversationMessagesSeenUpdate);
    };
  }, [socket, dispatch, markMessageSeen, activeConversation, currentUserId]);

  const emitJoinRoom = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_JOIN_ROOM, roomId);
    },
    [socket]
  );

  const emitConversationMessagesSeen = useCallback(
    async (conversationId: string) => {
      try {
        await markConversationMessagesSeen(conversationId).unwrap();
        dispatch(markConversationMessagesAsSeen({ conversationId, userId: currentUserId }));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to mark conversation messages as seen:", error);
        }
      }
    },
    [markConversationMessagesSeen, dispatch, currentUserId]
  );

  return {
    emitJoinRoom,
    emitConversationMessagesSeen,
  };
};