import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { LoginRequest, RefreshTokenRequest, AuthResponse, ApiResponse } from "../../types/api";

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
    register: builder.mutation<AuthResponse, FormData>({
      query: (formData) => ({
        url: "/register",
        method: "POST",
        body: formData
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
    checkUsernameAvailability: builder.query<ApiResponse<{ available: boolean }>, string>({
      query: (username) => `/check-username/${encodeURIComponent(username)}`,
      keepUnusedDataFor: 0, // Disable caching for real-time checks
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useCheckUsernameAvailabilityQuery,
  useLazyCheckUsernameAvailabilityQuery,
} = authApi;