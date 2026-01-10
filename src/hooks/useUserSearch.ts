import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useLazySearchUsersByKeywordQuery } from "../features/user/userApi";
import type { RootState } from "../app/store";
import { debounce } from "../utils/debounce";
import { TIMING_CONFIG } from "../config/constants";

export const useUserSearch = () => {
  const [query, setQuery] = useState("");
  const currentUserId = useSelector((state: RootState) => state.user._id);
  const [searchUsers, { data, isLoading }] = useLazySearchUsersByKeywordQuery();

  const debouncedSearch = useMemo(
    () => debounce((keyword: string) => {
      if (keyword.trim()) {
        searchUsers({ keyword: keyword.trim() });
      }
    }, TIMING_CONFIG.DEBOUNCE_DELAY),
    [searchUsers]
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const filteredUsers = useMemo(() => {
    const users = data?.data?.data || [];
    return users.filter((user: any) => user._id !== currentUserId);
  }, [data, currentUserId]);

  const clearSearch = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    clearSearch,
    users: filteredUsers,
    isSearching: query.trim().length > 0,
    isLoading
  };
};
