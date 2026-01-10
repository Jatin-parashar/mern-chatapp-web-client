import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useLogoutMutation } from "../features/auth/authApi";
import { logout } from "../features/auth/authSlice";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import { authToasts } from "../utils/toast";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
      authToasts.logoutSuccess();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Logout error:", error);
      }
    } finally {
      dispatch(logout());
      dispatch(releaseChatInfo());
      dispatch(deleteUser());
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  return handleLogout;
};
