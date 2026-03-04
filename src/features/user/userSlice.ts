import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/entities";

type UserState = Omit<User, 'createdAt' | 'updatedAt'>;

const initialState: UserState = {
  _id: "",
  name: "",
  username: "",
  status: "",
  profilePic: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateStatus: (state, action: PayloadAction<{ status: string }>) => {
      state.status = action.payload.status;
    },
    updateProfilePic: (state, action: PayloadAction<{ profilePic: string }>) => {
      state.profilePic = action.payload.profilePic;
    },
    updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    deleteUser: () => initialState,
  },
});

export const { updateStatus, updateProfilePic, updateUser, deleteUser } = userSlice.actions;
export default userSlice.reducer;