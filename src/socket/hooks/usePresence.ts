import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { setOnlineUsers } from "../../features/chat/chatSlice";
import { useSocketInstance } from "../SocketContext";
import { SOCKET_ONLINE_USERS } from "../socketEvents";

export const usePresence = () => {
  const { socket } = useSocketInstance();
  const dispatch = useDispatch();
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);

  useEffect(() => {
    if (!socket) return;

    const handleOnlineUsers = (users: string[]) => {
      dispatch(setOnlineUsers(users));
    };

    socket.on(SOCKET_ONLINE_USERS, handleOnlineUsers);

    return () => {
      socket.off(SOCKET_ONLINE_USERS, handleOnlineUsers);
    };
  }, [socket, dispatch]);

  return { onlineUsers };
};
