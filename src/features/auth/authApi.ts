import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { LoginRequest, RegisterRequest, RefreshTokenRequest, AuthResponse, ApiResponse } from "../../types/api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQuery("auth"),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/register",
        method: "POST",
        body: userData,
      }),
    }),
    refresh: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/refreshToken",
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation<ApiResponse, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
} = authApi;