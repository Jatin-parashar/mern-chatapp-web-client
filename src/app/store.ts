import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/es/storage";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import { authApi } from "../features/auth/authApi";
import { userApi } from "../features/user/userApi";
import { chatApi } from "../features/chat/chatApi";
import { callApi } from "../features/call/callApi";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import chatReducer from "../features/chat/chatSlice";
import callReducer from "../features/call/callSlice";
import { APP_CONFIG } from "../config/constants";

const authPersistConfig = {
  key: "chat.v0.auth",
  storage,
};

const userPersistConfig = {
  key: "chat.v0.user",
  storage,
};

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  [callApi.reducerPath]: callApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  user: persistReducer(userPersistConfig, userReducer),
  chat: chatReducer,
  call: callReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['call.peer', 'call.localStream', 'call.remoteStream'],
      },
    }).concat(
      authApi.middleware,
      userApi.middleware,
      chatApi.middleware,
      callApi.middleware
    ),
  devTools: APP_CONFIG.ENABLE_DEV_TOOLS,
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;