import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { LoginRequest, AuthResponse, ApiResponse } from "../../types/api";

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
  useLogoutMutation,
  useCheckUsernameAvailabilityQuery,
  useLazyCheckUsernameAvailabilityQuery,
} = authApi;