import { configureStore } from "@reduxjs/toolkit";
import { eventApi } from "./api/Event";
import { authApi } from "./api/Auth";
import authReducer from "./features/authSlice";

const store = configureStore({
  reducer: {
    [eventApi.reducerPath]: eventApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(eventApi.middleware, authApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
