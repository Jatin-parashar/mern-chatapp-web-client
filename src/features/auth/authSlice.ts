import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken: string | null;
  email: string;
}

interface SetCredentialsPayload {
  accessToken: string;
  email: string;
}

const initialState: AuthState = {
  accessToken: null,
  email: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }: PayloadAction<SetCredentialsPayload>) => {
      state.accessToken = payload.accessToken;
      state.email = payload.email;
    },
    logout: () => initialState,
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;