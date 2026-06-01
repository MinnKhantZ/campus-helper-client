import { useColorScheme } from 'react-native';
import { LightTheme, DarkTheme } from '../constants/Colors';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export type AppTheme = {
  readonly gradientStart: string;
  readonly gradientMid: string;
  readonly gradientEnd: string;
  readonly background: string;
  readonly surface: string;
  readonly surfaceSolid: string;
  readonly text: string;
  readonly textMuted: string;
  readonly textInverse: string;
  readonly primary: string;
  readonly primaryLight: string;
  readonly primaryDark: string;
  readonly secondary: string;
  readonly accent: string;
  readonly border: string;
  readonly borderStrong: string;
  readonly error: string;
  readonly errorBg: string;
  readonly success: string;
  readonly cardBlur: number;
  readonly tabBarBlur: number;
  readonly overlay: string;
  readonly placeholder: string;
  readonly chip: string;
  readonly chipText: string;
  readonly skeleton: string;
};

export function useTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DarkTheme : LightTheme;
}

