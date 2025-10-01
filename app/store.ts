import { configureStore } from "@reduxjs/toolkit";
import { eventApi } from "./api/Event";
import { authApi } from "./api/Auth";
import { clubApi } from "./api/Club";
import { marketplaceApi } from "./api/Marketplace";
import authReducer from "./features/authSlice";
import { messageApi } from "./api/Message";
import { userApi } from "./api/User";

const store = configureStore({
  reducer: {
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  [clubApi.reducerPath]: clubApi.reducer,
    [marketplaceApi.reducerPath]: marketplaceApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(eventApi.middleware, authApi.middleware, clubApi.middleware, marketplaceApi.middleware, userApi.middleware, messageApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
