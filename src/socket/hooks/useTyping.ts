import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setTypingStatus } from "../../features/chat/chatSlice";
import { useSocketInstance } from "../SocketContext";
import { SOCKET_TYPING, SOCKET_STOP_TYPING } from "../socketEvents";
import type { TypingEventData, StopTypingEventData } from "../../types/socket";

export const useTyping = () => {
  const { socket } = useSocketInstance();
  const dispatch = useDispatch();
  const typingStatus = useSelector((state: RootState) => state.chat.typingStatus);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId, conversationId }: TypingEventData) => {
      dispatch(setTypingStatus({ conversationId, userId, isTyping: true }));
    };

    const handleStopTyping = ({ userId, conversationId }: StopTypingEventData) => {
      dispatch(setTypingStatus({ conversationId, userId, isTyping: false }));
    };

    socket.on(SOCKET_TYPING, handleTyping);
    socket.on(SOCKET_STOP_TYPING, handleStopTyping);

    return () => {
      socket.off(SOCKET_TYPING, handleTyping);
      socket.off(SOCKET_STOP_TYPING, handleStopTyping);
    };
  }, [socket, dispatch]);

  const emitTyping = useCallback(
    (conversationId: string, userId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_TYPING, { conversationId, userId });
    },
    [socket]
  );

  const emitStopTyping = useCallback(
    (conversationId: string, userId: string) => {
      if (!socket) return;
      socket.emit(SOCKET_STOP_TYPING, { conversationId, userId });
    },
    [socket]
  );

  return {
    typingStatus,
    emitTyping,
    emitStopTyping,
  };
};