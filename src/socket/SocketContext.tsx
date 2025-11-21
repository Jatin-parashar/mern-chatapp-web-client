import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { socketURL } from "../utils/constants";
import { SOCKET_CONNECT, SOCKET_SETUP } from "./socketEvents";

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export const useSocketInstance = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketInstance must be used within SocketContextProvider");
  }
  return context;
};

interface SocketContextProviderProps {
  children: ReactNode;
}

export const SocketContextProvider = ({ children }: SocketContextProviderProps) => {
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  
  const socket = useMemo(() => io(socketURL, { 
    autoConnect: false
  }), []);

  useEffect(() => {
    if (!currentUserId || !accessToken) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    socket.auth = { token: accessToken };
    
    if (socket.connected) {
      socket.disconnect();
    }
    socket.connect();

    const onConnect = () => {
      console.log(`Socket connected: ${socket.id}`);
      socket.emit(SOCKET_SETUP, currentUserId);
    };

    const onConnectError = (error: Error) => {
      console.error('Socket authentication error:', error.message);
    };

    socket.on(SOCKET_CONNECT, onConnect);
    socket.on('connect_error', onConnectError);

    return () => {
      if (socket.connected) {
        console.log(`Socket disconnected: ${socket.id}`);
        socket.disconnect();
      }
      socket.off(SOCKET_CONNECT, onConnect);
      socket.off('connect_error', onConnectError);
    };
  }, [currentUserId, accessToken, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};