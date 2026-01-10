import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { setCredentials } from "../features/auth/authSlice";
import { updateUser } from "../features/user/userSlice";
import { useLazyGetUserByIdQuery } from "../features/user/userApi";
import { authToasts, showToast } from "../utils/toast";
import type { AuthData } from "../types";

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [fetchUserById] = useLazyGetUserByIdQuery();

  const handleAuthSuccess = async (data: AuthData) => {
    const { user, accessToken, refreshToken } = data;

    dispatch(setCredentials({ email: user.email, accessToken }));
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    const userResult = await fetchUserById(user._id).unwrap();
    if (userResult.data?.user) {
      dispatch(updateUser(userResult.data.user));
      return userResult.data.user;
    }
    return null;
  };

  const handleLogin = async (result: any) => {
    try {
      const user = await handleAuthSuccess(result.data as AuthData);
      if (user) {
        authToasts.loginSuccess(user.name);
        navigate("/");
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (result: any) => {
    try {
      const user = await handleAuthSuccess(result.data as AuthData);
      if (user) {
        authToasts.registerSuccess(user.name);
        navigate("/");
      }
    } catch (error: any) {
      showToast.error(error?.data?.message || "Registration failed");
    }
  };

  return { handleLogin, handleRegister };
};
