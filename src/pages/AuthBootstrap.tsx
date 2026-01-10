import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";

export default function AuthBootstrap() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    // Token refresh is handled automatically by baseQueryWithReauth in api.ts
    // when any API call returns 401
  }, [accessToken]);

  return null;
}