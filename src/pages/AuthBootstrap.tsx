import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import type { RootState } from "../app/store";
import decodeJwt from "../utils/jwtDecoder";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    // Check if current token is expired and clear it
    if (accessToken) {
      try {
        const decoded = decodeJwt(accessToken);
        if (decoded && decoded.exp * 1000 < Date.now()) {
          // Token is expired, clear it
          dispatch(logout());
          dispatch(releaseChatInfo());
          dispatch(deleteUser());
        }
      } catch (e) {
        // Invalid token, clear it
        dispatch(logout());
        dispatch(releaseChatInfo());
        dispatch(deleteUser());
      }
    }
  }, [accessToken, dispatch]);

  return null;
}