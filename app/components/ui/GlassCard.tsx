import React from 'react';
import { Platform, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  /** Tint override for BlurView on iOS */
  tint?: 'light' | 'dark' | 'default';
  /** Extra overlay colour – useful for tinted variants */
  overlayColor?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity,
  tint,
  overlayColor,
}) => {
  const theme = useTheme();
  const blurIntensity = intensity ?? theme.cardBlur;
  const blurTint = tint ?? (theme === theme ? 'light' : 'dark'); // overridden per theme below

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={blurIntensity}
        tint={tint ?? 'light'}
        style={[styles.card, { borderColor: theme.border }, style]}
      >
        {overlayColor ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, borderRadius: 16 }]} />
        ) : null}
        {children}
      </BlurView>
    );
  }

  // Android fallback: semi-transparent View
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      {overlayColor ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, borderRadius: 16 }]} />
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

export default GlassCard;
