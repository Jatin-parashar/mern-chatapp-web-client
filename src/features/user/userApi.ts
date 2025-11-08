import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { UpdateUserRequest, UserResponse } from "../../types/api";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQuery("user"),
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserResponse, void>({
      query: () => "/me",
    }),
    getAllUsers: builder.query<UserResponse, void>({
      query: () => "/all",
    }),
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `/${id}`,
    }),
    searchUsersByKeyword: builder.query<UserResponse, string>({
      query: (keyword) => `/search?keyword=${keyword}`,
    }),
    updateUserInfo: builder.mutation<UserResponse, UpdateUserRequest>({
      query: (userInfo) => ({
        url: "/update",
        method: "PATCH",
        body: userInfo,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useGetCurrentUserQuery,
  useSearchUsersByKeywordQuery,
  useLazyGetAllUsersQuery,
  useLazyGetCurrentUserQuery,
  useLazyGetUserByIdQuery,
  useLazySearchUsersByKeywordQuery,
  useUpdateUserInfoMutation,
} = userApi;