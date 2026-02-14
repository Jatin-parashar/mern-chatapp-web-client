import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { socketURL } from "../utils/constants";
import { SOCKET_CONNECT, SOCKET_SETUP, SOCKET_ERROR } from "./socketEvents";
import { toast } from "sonner";

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
  
  const socketRef = useRef<Socket | null>(null);
  
  if (!socketRef.current) {
    socketRef.current = io(socketURL, { autoConnect: false });
  }
  
  const socket = socketRef.current;

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
      if (import.meta.env.DEV) {
        console.log(`Socket connected: ${socket.id}`);
      }
      socket.emit(SOCKET_SETUP);
    };

    const onConnectError = (error: Error) => {
      if (import.meta.env.DEV) {
        console.error('Socket authentication error:', error.message);
      }
      if (error.message.includes('Authentication')) {
        socket.disconnect();
      }
    };

    const onSocketError = ({ message }: { message: string }) => {
      if (import.meta.env.DEV) {
        console.error('Socket error:', message);
      }
      toast.error(message || 'Socket operation failed');
    };

    socket.on(SOCKET_CONNECT, onConnect);
    socket.on('connect_error', onConnectError);
    socket.on(SOCKET_ERROR, onSocketError);

    return () => {
      socket.off(SOCKET_CONNECT, onConnect);
      socket.off('connect_error', onConnectError);
      socket.off(SOCKET_ERROR, onSocketError);
    };
  }, [currentUserId, accessToken, socket]);
  
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};