import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { useTheme, spacing, radius } from '../theme';
import { setThemeMode } from '../features/settingsSlice';
import { useChangePasswordMutation } from '../api/Auth';
import type { ThemeMode } from '../types';
import type { RootState } from '../store';

const THEME_OPTIONS: { label: string; value: ThemeMode; icon: string }[] = [
  { label: 'Light', value: 'light', icon: 'white-balance-sunny' },
  { label: 'Dark', value: 'dark', icon: 'moon-waning-crescent' },
  { label: 'System', value: 'system', icon: 'theme-light-dark' },
];

const SettingsScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const currentTheme = useSelector((s: RootState) => s.settings.themeMode);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [notifStatus, setNotifStatus] = useState<string | null>(null);

  useEffect(() => {
    Notifications.getPermissionsAsync().then((p) => setNotifStatus(p.status));
  }, []);

  const handleThemeChange = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };

  const handleChangePassword = async () => {
    setPwError('');
    setPwSuccess('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('All password fields are required');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      await changePassword({ oldPassword, newPassword }).unwrap();
      setPwSuccess('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'data' in err
          ? (err as { data: { message: string } }).data?.message
          : undefined;
      setPwError(msg || 'Failed to change password');
    }
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
          <View style={{ width: 32 }} />
        </MotiView>

        {/* Appearance */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 150, damping: 18, stiffness: 160 }}
        >
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
            {THEME_OPTIONS.map((opt) => {
              const selected = currentTheme === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => handleThemeChange(opt.value)}
                  style={[styles.themeRow, selected && { backgroundColor: theme.chip }]}
                  activeOpacity={0.7}
                >
                  <Icon
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    name={opt.icon as any}
                    size={22}
                    color={selected ? theme.primary : theme.textMuted}
                  />
                  <Text
                    style={[
                      styles.themeLabel,
                      { color: selected ? theme.primary : theme.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected && (
                    <Icon name="check-circle" size={20} color={theme.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </GlassCard>
        </MotiView>

        {/* Change Password */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 250, damping: 18, stiffness: 160 }}
        >
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Change Password</Text>
            <GlassInput
              label="Current Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <GlassInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <GlassInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {pwError ? (
              <View style={[styles.banner, { backgroundColor: theme.errorBg }]}>
                <Icon name="alert-circle-outline" size={16} color={theme.error} />
                <Text style={[styles.bannerText, { color: theme.error }]}>{pwError}</Text>
              </View>
            ) : null}

            {pwSuccess ? (
              <View style={[styles.banner, { backgroundColor: 'rgba(5, 150, 105, 0.1)' }]}>
                <Icon name="check-circle-outline" size={16} color={theme.success} />
                <Text style={[styles.bannerText, { color: theme.success }]}>{pwSuccess}</Text>
              </View>
            ) : null}

            <GlassButton
              title="Update Password"
              onPress={handleChangePassword}
              loading={changingPassword}
              style={styles.saveBtn}
            />
          </GlassCard>
        </MotiView>

        {/* Notifications */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 350, damping: 18, stiffness: 160 }}
        >
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Notifications</Text>
            <View style={styles.notifRow}>
              <Icon name="bell-outline" size={22} color={theme.text} />
              <Text style={[styles.notifLabel, { color: theme.text }]}>
                Push Notifications
              </Text>
              {notifStatus === 'granted' ? (
                <View style={styles.notifStatus}>
                  <Icon name="check-circle" size={18} color={theme.success} />
                  <Text style={[styles.notifStatusText, { color: theme.success }]}>
                    Enabled
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleOpenSettings}
                  style={[styles.enableBtn, { borderColor: theme.primary }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.enableBtnText, { color: theme.primary }]}>
                    Enable
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </GlassCard>
        </MotiView>

        {/* About */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 450, damping: 18, stiffness: 160 }}
        >
          <GlassCard style={[styles.card, styles.aboutCard]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.aboutText, { color: theme.textMuted }]}>
              Campus Helper v1.0.0
            </Text>
            <Text style={[styles.aboutText, { color: theme.textMuted }]}>
              Built with React Native + Expo
            </Text>
          </GlassCard>
        </MotiView>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  themeLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 12,
  },
  bannerText: { fontSize: 13, fontWeight: '500' },
  saveBtn: { marginTop: 4 },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  notifStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notifStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  enableBtn: {
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  enableBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  aboutCard: {
    alignItems: 'center',
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default SettingsScreen;
