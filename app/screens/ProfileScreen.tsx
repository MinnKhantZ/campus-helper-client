import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import GlassButton from '../components/ui/GlassButton';
import { useTheme, spacing, radius } from '../theme';
import { useUpdateProfileMutation, useLogoutMutation } from '../api/Auth';
import { setUser, clearAuth } from '../features/authSlice';
import type { RootState } from '../store';
import type { RootStackParamList } from '../Navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigation = useNavigation<Nav>();
  const user = useSelector((s: RootState) => s.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [major, setMajor] = useState(user?.major ?? '');
  const [rollno, setRollno] = useState(user?.rollno ?? '');
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasChanges =
    name !== user?.name ||
    major !== (user?.major ?? '') ||
    rollno !== (user?.rollno ?? '');

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const res = await updateProfile({ name, major, rollno }).unwrap();
      dispatch(setUser(res.user));
      setSuccess('Profile updated');
    } catch {
      setError('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // still log out locally
    }
    dispatch(clearAuth());
  };

  if (!user) return null;

  const initials = user.name.charAt(0).toUpperCase();

  const scroll = (
    <ScrollView
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
        {/* Avatar */}
        <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100, damping: 16, stiffness: 200 }}
            style={styles.avatarWrap}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.avatarCircle}
            >
              <Text style={[styles.avatarText, { color: '#fff' }]}>{initials}</Text>
            </LinearGradient>
            <Text style={[styles.roleBadge, { backgroundColor: theme.chip, color: theme.chipText }]}>
              {user.role}
            </Text>
          </MotiView>

          {/* Info Card */}
          <MotiView
            from={{ opacity: 0, translateY: 40 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay: 250, damping: 18, stiffness: 160 }}
          >
            <GlassCard style={styles.card}>
              {/* Phone (read-only) */}
              <View style={styles.readonlyRow}>
                <Icon name="phone-outline" size={18} color={theme.textMuted} />
                <Text style={[styles.readonlyLabel, { color: theme.textMuted }]}>Phone</Text>
                <Text style={[styles.readonlyValue, { color: theme.text }]}>{user.phone}</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <GlassInput
                label="Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
              <GlassInput
                label="Major"
                value={major}
                onChangeText={setMajor}
                placeholder="e.g. Computer Science"
              />
              <GlassInput
                label="Roll No"
                value={rollno}
                onChangeText={setRollno}
                placeholder="e.g. 2024-001"
              />

              {error ? (
                <View style={[styles.banner, { backgroundColor: theme.errorBg }]}>
                  <Icon name="alert-circle-outline" size={16} color={theme.error} />
                  <Text style={[styles.bannerText, { color: theme.error }]}>{error}</Text>
                </View>
              ) : null}

              {success ? (
                <View style={[styles.banner, { backgroundColor: 'rgba(5, 150, 105, 0.1)' }]}>
                  <Icon name="check-circle-outline" size={16} color={theme.success} />
                  <Text style={[styles.bannerText, { color: theme.success }]}>{success}</Text>
                </View>
              ) : null}

              <GlassButton
                title="Save Changes"
                onPress={handleSave}
                loading={isLoading}
                disabled={!hasChanges}
                style={styles.saveBtn}
              />
            </GlassCard>
          </MotiView>

          {/* Settings Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={[styles.settingsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.7}
          >
            <Icon name="cog-outline" size={22} color={theme.text} />
            <Text style={[styles.settingsText, { color: theme.text }]}>Settings</Text>
            <Icon name="chevron-right" size={22} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Logout */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', delay: 400, duration: 300 }}
          >
            <GlassButton
              title="Logout"
              variant="danger"
              onPress={handleLogout}
              loading={loggingOut}
              style={styles.logoutBtn}
            />
          </MotiView>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {scroll}
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
  avatarWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
  },
  roleBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 8,
    overflow: 'hidden',
  },
  card: {
    padding: spacing.lg,
  },
  readonlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
  },
  readonlyLabel: {
    fontSize: 14,
    width: 60,
  },
  readonlyValue: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm,
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
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutBtn: {
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});

export default ProfileScreen;
