import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import type { RootState } from "../app/store";
import decodeJwt from "../utils/jwtDecoder";
import { authToasts } from "../utils/toast";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const checkToken = () => {
      try {
        const decoded = decodeJwt(accessToken);
        if (!decoded || decoded.exp * 1000 < Date.now()) {
          dispatch(logout());
          dispatch(releaseChatInfo());
          dispatch(deleteUser());
          localStorage.removeItem('refreshToken');
          authToasts.sessionExpired();
        }
      } catch (e) {
        dispatch(logout());
        dispatch(releaseChatInfo());
        dispatch(deleteUser());
        localStorage.removeItem('refreshToken');
      }
    };

    checkToken();
    const interval = setInterval(checkToken, 60000);

    return () => clearInterval(interval);
  }, [accessToken, dispatch]);

  return null;
}