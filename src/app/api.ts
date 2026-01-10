import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import type { RootState } from "./store";
import { logout, setCredentials } from "../features/auth/authSlice";
import { authToasts } from "../utils/toast";
import { API_CONFIG } from "../config/constants";

export const baseQuery = (path = "") => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${API_CONFIG.SERVER_URL}/api/v1/${path}`,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      if (headers.get('content-type') === 'multipart/form-data') {
        headers.delete('content-type');
      }
      return headers;
    },
  });

  const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        api.dispatch(logout());
        api.dispatch(releaseChatInfo());
        api.dispatch(deleteUser());
        authToasts.sessionExpired();
        return result;
      }

      const refreshResult = await fetchBaseQuery({
        baseUrl: `${API_CONFIG.SERVER_URL}/api/v1/auth`,
        credentials: "include",
      })(
        { 
          url: "refreshToken", 
          method: "POST",
          body: { refreshToken }
        },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        const response = refreshResult.data as any;
        const data = response.data;
        
        api.dispatch(
          setCredentials({
            email: data.user?.email || (api.getState() as RootState).auth.email,
            accessToken: data.accessToken,
          })
        );
        
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        api.dispatch(releaseChatInfo());
        api.dispatch(deleteUser());
        localStorage.removeItem('refreshToken');
        authToasts.sessionExpired();
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};