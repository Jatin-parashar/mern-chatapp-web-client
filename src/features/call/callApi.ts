import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../app/api";
import type { CallHistoryResponse, CallDetailsResponse } from "../../types/api";

export const callApi = createApi({
  reducerPath: "callApi",
  baseQuery: baseQuery("call"),
  endpoints: (builder) => ({
    getCallHistory: builder.query<CallHistoryResponse, { 
      limit?: number; 
      skip?: number 
    } | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.skip) searchParams.append('skip', params.skip.toString());
        return `/history${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      },
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