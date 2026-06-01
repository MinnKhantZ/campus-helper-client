import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useLoginMutation } from '../api/Auth';
import { useDispatch } from 'react-redux';
import { setTokens } from '../features/authSlice';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { useTheme, spacing, radius } from '../theme';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();
  const dispatch = useDispatch();
  const theme = useTheme();

  const shakeX = useSharedValue(0);
  const animatedShake = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const onSubmit = async () => {
    try {
      const data = await login({ phone, password }).unwrap();
      dispatch(setTokens(data));
    } catch {
      shakeX.value = withSequence(
        withTiming(-12, { duration: 60 }),
        withTiming(12, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100, damping: 16, stiffness: 200 }}
            style={styles.logoWrap}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.logoCircle}
            >
              <Icon name="school" size={44} color="#ffffff" />
            </LinearGradient>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 220, duration: 400 }}
          >
            <Text style={[styles.appName, { color: theme.text }]}>Campus Helper</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              Sign in to your account
            </Text>
          </MotiView>

          {/* Form Card */}
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 300, damping: 18, stiffness: 160 }}
            style={styles.cardWrap}
          >
            <Animated.View style={animatedShake}>
              <GlassCard style={styles.card}>
                <GlassInput
                  label="Phone Number"
                  placeholder="e.g. 09xxxxxxxxx"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  textContentType="telephoneNumber"
                />
                <GlassInput
                  label="Password"
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.textMuted}
                      />
                    </TouchableOpacity>
                  }
                />

                {error ? (
                  <MotiView
                    from={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={[styles.errorBanner, { backgroundColor: theme.errorBg }]}
                  >
                    <Icon name="alert-circle-outline" size={16} color={theme.error} />
                    <Text style={[styles.errorText, { color: theme.error }]}>
                      Incorrect phone or password
                    </Text>
                  </MotiView>
                ) : null}

                <GlassButton
                  title="Sign In"
                  onPress={onSubmit}
                  loading={isLoading}
                  style={styles.loginBtn}
                />
              </GlassCard>
            </Animated.View>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  cardWrap: { width: '100%' },
  card: { padding: spacing.lg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 12,
  },
  errorText: { fontSize: 13, fontWeight: '500' },
  loginBtn: { marginTop: 4 },
});

export default LoginScreen;

