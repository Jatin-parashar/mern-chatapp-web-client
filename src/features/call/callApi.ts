import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { CallHistoryResponse, CallDetailsResponse } from "../../types/api";

export const callApi = createApi({
  reducerPath: "callApi",
  baseQuery: baseQuery("call"),
  endpoints: (builder) => ({
    getCallHistory: builder.query<CallHistoryResponse, number | void>({
      query: (limit = 50) => `/history?limit=${limit}`,
    }),
    getCallById: builder.query<CallDetailsResponse, string>({
      query: (callId) => `/${callId}`,
    }),
  }),
});

export const {
  useGetCallHistoryQuery,
  useGetCallByIdQuery,
  useLazyGetCallHistoryQuery,
  useLazyGetCallByIdQuery,
} = callApi;