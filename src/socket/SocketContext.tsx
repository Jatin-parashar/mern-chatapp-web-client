import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../app/store";
import { socketURL } from "../utils/constants";
import { SOCKET_CONNECT, SOCKET_SETUP, SOCKET_ERROR } from "./socketEvents";
import { toast } from "sonner";
import { setCredentials, logout } from "../features/auth/authSlice";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import { API_CONFIG } from "../config/constants";
import { authToasts } from "../utils/toast";

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
  const dispatch = useDispatch();
  const isRefreshingRef = useRef(false);
  
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

    const onConnectError = async (error: Error) => {
      if (import.meta.env.DEV) {
        console.error('Socket authentication error:', error.message);
      }
      const isAuthError = error.message.toLowerCase().includes('auth') || 
                          error.message.toLowerCase().includes('token') ||
                          error.message.toLowerCase().includes('expired');
      if (isAuthError && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        socket.disconnect();
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token');

          const res = await fetch(`${API_CONFIG.SERVER_URL}/api/v1/auth/refreshToken`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) throw new Error('Refresh failed');

          const json = await res.json();
          const newToken = json?.data?.accessToken;
          if (!newToken) throw new Error('No token in response');

          dispatch(setCredentials({
            email: json.data?.user?.email,
            accessToken: newToken,
          }));
          // accessToken in Redux will update → useEffect re-runs → socket reconnects with new token
        } catch {
          dispatch(logout());
          dispatch(releaseChatInfo());
          dispatch(deleteUser());
          localStorage.removeItem('refreshToken');
          authToasts.sessionExpired();
        } finally {
          isRefreshingRef.current = false;
        }
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