import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '../types';
import type { AppDispatch } from '../store';

interface SettingsState {
  themeMode: ThemeMode;
}

const initialState: SettingsState = {
  themeMode: 'system',
};

const slice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      AsyncStorage.setItem('themeMode', action.payload).catch(() => {});
    },
    hydrateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      if (action.payload.themeMode) state.themeMode = action.payload.themeMode;
    },
  },
});

export const { setThemeMode, hydrateSettings } = slice.actions;
export default slice.reducer;

export const loadSettingsFromStorage = () => async (dispatch: AppDispatch) => {
  try {
    const themeMode = await AsyncStorage.getItem('themeMode');
    if (themeMode) {
      dispatch(hydrateSettings({ themeMode: themeMode as ThemeMode }));
    }
  } catch {
    // ignore
  }
};
