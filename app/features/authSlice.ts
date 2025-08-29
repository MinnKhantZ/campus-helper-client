import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthState, AuthTokens, User } from '../types';
import type { AppDispatch } from '../store';

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (state, { payload }: PayloadAction<AuthTokens & { user?: User }>) => {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      if (payload.user) state.user = payload.user;
      AsyncStorage.multiSet([
        ['accessToken', state.accessToken ?? ''],
        ['refreshToken', state.refreshToken ?? ''],
        ['user', JSON.stringify(state.user ?? {})],
      ]).catch(() => {});
    },
    setUser: (state, { payload }: PayloadAction<User | null>) => {
      state.user = payload;
      AsyncStorage.setItem('user', JSON.stringify(payload)).catch(() => {});
    },
    clearAuth: (state) => {
      state.accessToken = null as any;
      state.refreshToken = null as any;
      state.user = null;
      AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']).catch(() => {});
    },
    hydrate: (state, { payload }: PayloadAction<Partial<AuthState>>) => {
      state.accessToken = payload.accessToken ?? null;
      state.refreshToken = payload.refreshToken ?? null;
      state.user = (payload.user as any) ?? null;
      state.hydrated = true;
    },
  },
});

export const { setTokens, setUser, clearAuth, hydrate } = slice.actions;
export default slice.reducer;

export const loadAuthFromStorage = () => async (dispatch: AppDispatch) => {
  try {
  const result = await AsyncStorage.multiGet(['accessToken', 'refreshToken', 'user']);
  const accessToken = result.find(([k]) => k === 'accessToken')?.[1] ?? null;
  const refreshToken = result.find(([k]) => k === 'refreshToken')?.[1] ?? null;
  const userRaw = result.find(([k]) => k === 'user')?.[1] ?? null;
    dispatch(
      hydrate({
    accessToken,
    refreshToken,
    user: userRaw ? JSON.parse(userRaw) : null,
      })
    );
  } catch (_) {
    dispatch(hydrate({}));
  }
};
