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
    getAllUsers: builder.query<UserResponse, { limit?: number; skip?: number } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.skip) searchParams.append('skip', params.skip.toString());
        return `/all${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
    }),
    getUserById: builder.query<UserResponse, string>({
      query: (id) => `/${id}`,
    }),
    searchUsersByKeyword: builder.query<UserResponse, { 
      keyword: string; 
      limit?: number; 
      skip?: number 
    }>({
      query: ({ keyword, limit, skip }) => {
        const searchParams = new URLSearchParams({ keyword });
        if (limit) searchParams.append('limit', limit.toString());
        if (skip) searchParams.append('skip', skip.toString());
        return `/search?${searchParams.toString()}`;
      },
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