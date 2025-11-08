import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { releaseChatInfo } from "../features/chat/chatSlice";
import { deleteUser } from "../features/user/userSlice";
import type { RootState } from "./store";
import { getServerURL } from "../utils/constants";
import { logout, setCredentials } from "../features/auth/authSlice";

export const baseQuery = (path = "") => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: getServerURL(path),
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
      const refreshResult = await fetchBaseQuery({
        baseUrl: getServerURL("auth"),
        credentials: "include",
      })(
        { 
          url: "/refreshToken", 
          method: "POST",
          body: { refreshToken: localStorage.getItem('refreshToken') }
        },
        api,
        extraOptions
      );

      if (refreshResult?.data) {
        const response = refreshResult.data as any;
        const data = response.data;
        api.dispatch(
          setCredentials({
            email: data.user.email,
            accessToken: data.accessToken,
          })
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        api.dispatch(logout());
        api.dispatch(releaseChatInfo());
        api.dispatch(deleteUser());
      }
    }

    return result;
  };

  return baseQueryWithReauth;
};