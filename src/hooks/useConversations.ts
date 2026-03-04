import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLazyGetUserConversationsQuery } from "../features/chat/chatApi";
import { setConversations } from "../features/chat/chatSlice";
import type { RootState } from "../app/store";
import { sortByDate } from "../utils/helpers";

export const useConversations = () => {
  const dispatch = useDispatch();
  const conversations = useSelector((state: RootState) => state.chat.conversations);
  const [getConversations, { data, isLoading }] = useLazyGetUserConversationsQuery();

  useEffect(() => {
    getConversations();
  }, [getConversations]);

  useEffect(() => {
    if (data?.data?.data) {
      dispatch(setConversations(data.data.data));
    }
  }, [data, dispatch]);

  const sortedConversations = useMemo(() => {
    return sortByDate(Object.values(conversations));
  }, [conversations]);

  return {
    conversations: sortedConversations,
    isLoading,
    refetch: getConversations
  };
};
