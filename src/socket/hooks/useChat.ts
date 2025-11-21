import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import {
  addMessage,
  addConversation,
  updateConversationsWithLatestMessage,
  updateMessageSeenStatus,
  updateConversationMessagesSeenStatus,
} from "../../features/chat/chatSlice";
import { useMarkMessageSeenMutation } from "../../features/chat/chatApi";
import { useSocketInstance } from "../SocketContext";
import {
  SOCKET_JOIN_ROOM,
  SOCKET_NEW_MESSAGE,
  SOCKET_MESSAGE_RECEIVED,
  SOCKET_NEW_CONVERSATION,
  SOCKET_NEW_CONVERSATION_RECEIVED,
  SOCKET_MESSAGE_SEEN,
  SOCKET_MESSAGE_SEEN_UPDATE,
  SOCKET_CONVERSATION_MESSAGES_SEEN,
  SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE,
} from "../socketEvents";
import type {
  ConversationReceivedEventData,
  MessageSeenUpdateEventData,
  ConversationMessagesSeenUpdateEventData,
} from "../../types/socket";
import type { Message } from "../../types/entities";

export const useChat = () => {
  const { socket } = useSocketInstance();
  const dispatch = useDispatch();
  const activeConversation = useSelector((state: RootState) => state.chat.activeConversation);
  const currentUserId = useSelector((state: RootState) => state.user._id);
  
  const activeConversationRef = useRef(activeConversation);
  const currentUserIdRef = useRef(currentUserId);
  const [markMessageSeen] = useMarkMessageSeenMutation();

  useEffect(() => {
    activeConversationRef.current = activeConversation;
    currentUserIdRef.current = currentUserId;
  }, [activeConversation, currentUserId]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = async (message: Message) => {
      const activeConv = activeConversationRef.current;
      const userId = currentUserIdRef.current;

      dispatch(updateConversationsWithLatestMessage(message));

      if (activeConv && activeConv._id === message.conversationId) {
        dispatch(addMessage(message));

        // Auto-mark as seen if in active conversation and not sender
        if (message.sender._id !== userId) {
          try {
            await markMessageSeen(message._id).unwrap();
            socket.emit(SOCKET_MESSAGE_SEEN, {
              conversationId: activeConv._id,
              messageId: message._id,
              userId,
            });
          } catch (error) {
            console.error("Failed to mark message as seen:", error);
          }
        }
      }
    };

    const handleConversationReceived = (data: ConversationReceivedEventData) => {
      dispatch(addConversation(data.conversation));
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
    socket.on(SOCKET_MESSAGE_SEEN_UPDATE, handleMessageSeenUpdate);
    socket.on(SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE, handleConversationMessagesSeenUpdate);

    return () => {
      socket.off(SOCKET_MESSAGE_RECEIVED, handleMessageReceived);
      socket.off(SOCKET_NEW_CONVERSATION_RECEIVED, handleConversationReceived);
      socket.off(SOCKET_MESSAGE_SEEN_UPDATE, handleMessageSeenUpdate);
      socket.off(SOCKET_CONVERSATION_MESSAGES_SEEN_UPDATE, handleConversationMessagesSeenUpdate);
    };
  }, [socket, dispatch, markMessageSeen]);

  const emitJoinRoom = useCallback(
    (roomId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_JOIN_ROOM, roomId);
    },
    [socket]
  );

  const emitNewMessage = useCallback(
    (message: Message) => {
      if (!socket) return;
      socket.emit(SOCKET_NEW_MESSAGE, { message });
    },
    [socket]
  );

  const emitNewConversation = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_NEW_CONVERSATION, { conversationId });
    },
    [socket]
  );

  const emitMessageSeen = useCallback(
    (conversationId: string, messageId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_MESSAGE_SEEN, { conversationId, messageId });
    },
    [socket]
  );

  const emitConversationMessagesSeen = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_CONVERSATION_MESSAGES_SEEN, { conversationId });
    },
    [socket]
  );

  return {
    emitJoinRoom,
    emitNewMessage,
    emitNewConversation,
    emitMessageSeen,
    emitConversationMessagesSeen,
  };
};