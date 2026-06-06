import { View, Text, StyleSheet, FlatList, Alert, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import { ActivityIndicator } from "react-native-paper";
import {
  useGetClubByIdQuery,
  useGetAnnouncementsQuery,
  usePostAnnouncementMutation,
  useApproveJoinMutation,
  useRejectJoinMutation,
  useLeaveClubMutation,
  useDeleteClubMutation,
} from "../api/Club";
import { useUsersLookupQuery } from "../api/User";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";
import AnimatedListItem from "../components/ui/AnimatedListItem";
import { useTheme, spacing, radius } from "../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const IconCircle = ({ icon, onPress, loading }: { icon: string; onPress: () => void; loading?: boolean }) => {
  const theme = useTheme();
  const s = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={anim}>
      <TouchableOpacity
        onPressIn={() => { s.value = withSpring(0.85, { damping: 12, stiffness: 300 }); }}
        onPressOut={() => { s.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        onPress={onPress}
        disabled={loading}
        style={[styles.iconCircle, { backgroundColor: theme.chip }]}
        activeOpacity={1}
      >
        {loading ? (
          <ActivityIndicator size={16} color={theme.primary} />
        ) : (
          <Icon name={icon as any} size={20} color={theme.primary} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const ClubInfoScreen = () => {
  const route = useRoute();
  const nav = useNavigation() as { navigate: (s: string, p?: unknown) => void; goBack: () => void };
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const id = Number(params.id);
  const { data: club, isLoading, refetch } = useGetClubByIdQuery(id);
  const { data: anns, refetch: refetchAnns, isFetching: loadingAnns } = useGetAnnouncementsQuery(id);
  const theme = useTheme();

  const allIdsToLookup = [
    ...(club?.student_ids || []),
    ...(club?.admin_id ? [club.admin_id] : []),
    ...(club?.pending_ids || []),
  ];
  const { data: allUsers } = useUsersLookupQuery(allIdsToLookup, { skip: !allIdsToLookup.length });
  const memberIdSet = new Set([...(club?.student_ids || []), ...(club?.admin_id ? [club.admin_id] : [])]);
  const members = (allUsers || []).filter((u) => memberIdSet.has(u.id));
  const pendingUsers = (allUsers || []).filter((u) => club?.pending_ids?.includes(u.id));

  const [content, setContent] = useState("");
  const [postAnnouncement, { isLoading: posting }] = usePostAnnouncementMutation();
  const [approveJoin, { isLoading: approving }] = useApproveJoinMutation();
  const [rejectJoin, { isLoading: rejecting }] = useRejectJoinMutation();
  const [leaveClub, { isLoading: leaving }] = useLeaveClubMutation();
  const [deleteClub, { isLoading: deleting }] = useDeleteClubMutation();
  const user = useSelector((s: RootState) => s.auth.user);

  const isOwner = !!user && !!club && club.admin_id === user.id;
  const isAdmin = !!user && user.role === "admin";
  const isMember = !!user && !!club && (club.admin_id === user.id || club.student_ids?.includes(user.id));

  const onPost = async () => {
    if (!content.trim()) return;
    try {
      await postAnnouncement({ id, content }).unwrap();
      setContent("");
      refetchAnns();
    } catch {
      Alert.alert("Error", "Failed to post announcement. Please try again.");
    }
  };

  const onApprove = async (userId: number) => {
    try {
      await approveJoin({ id, userId }).unwrap();
      refetch();
    } catch {
      Alert.alert("Error", "Failed to approve request.");
    }
  };

  const onReject = async (userId: number) => {
    try {
      await rejectJoin({ id, userId }).unwrap();
      refetch();
    } catch {
      Alert.alert("Error", "Failed to reject request.");
    }
  };

  const onLeave = () => {
    Alert.alert("Leave Club", "Are you sure you want to leave this club?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave", style: "destructive", onPress: async () => {
          try { await leaveClub(id).unwrap(); nav.goBack(); }
          catch { Alert.alert("Error", "Failed to leave club."); }
        },
      },
    ]);
  };

  const onDelete = () => {
    Alert.alert("Delete Club", "Are you sure you want to delete this club?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          try { await deleteClub(id).unwrap(); nav.goBack(); }
          catch { Alert.alert("Error", "Failed to delete club."); }
        },
      },
    ]);
  };

  if (isLoading || !club) {
    return (
      <LinearGradient colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]} style={styles.gradient}>
        <View style={styles.center}><ActivityIndicator color={theme.primary} /></View>
      </LinearGradient>
    );
  }

  const Header = (
    <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
      {/* Club info */}
      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 60 }}>
        <GlassCard style={styles.infoCard}>
          <View style={styles.clubHeader}>
            <View style={[styles.clubAvatar, { backgroundColor: theme.chip }]}>
              <Icon name="account-group" size={28} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.clubName, { color: theme.text }]}>{club.name}</Text>
              {club.description ? (
                <Text style={[styles.clubDesc, { color: theme.textMuted }]}>{club.description}</Text>
              ) : null}
              <View style={[styles.badge, { backgroundColor: theme.chip }]}>
                <Icon name="account-multiple" size={11} color={theme.primary} />
                <Text style={[styles.badgeText, { color: theme.primary }]}>{(club.student_ids?.length || 0) + (club.admin_id ? 1 : 0)} members</Text>
              </View>
            </View>
          </View>

          {/* Members list */}
          {members.length > 0 && (
            <View style={styles.membersSection}>
              <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Members</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {members.map((m) => (
                  <View key={m.id} style={[styles.memberChip, { backgroundColor: theme.chip }]}>
                    <Text style={[styles.memberInitial, { color: theme.primary }]}>{(m.name || "U").slice(0, 1).toUpperCase()}</Text>
                    <Text style={[styles.memberName, { color: theme.text }]} numberOfLines={1}>{m.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Open Chat */}
          {isMember && (
            <TouchableOpacity
              style={[styles.chatRow, { backgroundColor: theme.chip }]}
              onPress={() => nav.navigate("ClubChat", { id })}
              activeOpacity={0.7}
            >
              <Icon name="forum-outline" size={22} color={theme.primary} />
              <Text style={[styles.chatRowText, { color: theme.primary }]}>Open Club Chat</Text>
              <Icon name="chevron-right" size={22} color={theme.primary} />
            </TouchableOpacity>
          )}
        </GlassCard>
      </MotiView>

      {/* Pending requests */}
      {(isOwner || isAdmin) && (club.pending_ids?.length ?? 0) > 0 && (
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 120 }}>
          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Requests</Text>
            {club.pending_ids.map((uid: number) => {
              const pu = pendingUsers.find((u) => u.id === uid);
              return (
                <View key={uid} style={styles.pendingRow}>
                  <View style={[styles.memberChip, { backgroundColor: theme.chip }]}>
                    <Text style={[styles.memberInitial, { color: theme.primary }]}>{(pu?.name || "U").slice(0, 1).toUpperCase()}</Text>
                    <Text style={[styles.memberName, { color: theme.text }]} numberOfLines={1}>{pu ? pu.name : `User #${uid}`}</Text>
                  </View>
                  <View style={styles.pendingActions}>
                    <GlassButton title="Approve" onPress={() => onApprove(uid)} loading={approving} variant="primary" style={styles.pendingBtn} />
                    <GlassButton title="Reject" onPress={() => onReject(uid)} loading={rejecting} variant="ghost" style={styles.pendingBtn} />
                  </View>
                </View>
              );
            })}
          </GlassCard>
        </MotiView>
      )}

      {/* Post announcement */}
      {(isOwner || isAdmin) && (
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: "spring", delay: 160 }}>
          <GlassCard style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Post Announcement</Text>
            <GlassInput
              placeholder="Write an announcement..."
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={3}
              style={{ marginTop: 8, minHeight: 72, textAlignVertical: "top" }}
            />
            <GlassButton title="Post" onPress={onPost} loading={posting} disabled={!content.trim()} style={{ marginTop: 8 }} />
          </GlassCard>
        </MotiView>
      )}

      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: spacing.sm, marginBottom: spacing.xs }]}>Announcements</Text>
    </View>
  );

  return (
    <LinearGradient colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <IconCircle icon="arrow-left" onPress={() => nav.goBack()} />
          <Text style={[styles.topTitle, { color: theme.text }]} numberOfLines={1}>Club Info</Text>
          <View style={styles.topActions}>
            {(isOwner || isAdmin) && (
              <>
                <IconCircle icon="pencil-outline" onPress={() => nav.navigate("ClubForm", { id })} />
                <IconCircle icon="delete-outline" onPress={onDelete} loading={deleting} />
              </>
            )}
            {isMember && !isOwner && (
              <IconCircle icon="logout" onPress={onLeave} loading={leaving} />
            )}
          </View>
        </View>

        <FlatList
          data={anns || []}
          keyExtractor={(i) => String(i.id)}
          ListHeaderComponent={Header}
          renderItem={({ item, index }) => (
            <AnimatedListItem index={index}>
              <GlassCard style={[styles.annCard, { marginHorizontal: spacing.md }]}>
                <View style={styles.annHeader}>
                  <View style={[styles.annAvatar, { backgroundColor: theme.chip }]}>
                    <Text style={[styles.memberInitial, { color: theme.primary }]}>
                      {(item.author?.name || "U").slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.annAuthor, { color: theme.text }]}>{item.author ? item.author.name : `User #${item.user_id}`}</Text>
                </View>
                <Text style={[styles.annContent, { color: theme.textMuted }]}>{item.content}</Text>
              </GlassCard>
            </AnimatedListItem>
          )}
          refreshing={loadingAnns}
          onRefresh={() => { refetch(); refetchAnns(); }}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  topTitle: { flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" },
  topActions: { flexDirection: "row", gap: 8 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  infoCard: { marginBottom: spacing.sm, padding: spacing.md },
  sectionCard: { marginBottom: spacing.sm, padding: spacing.md },
  annCard: { marginBottom: spacing.sm, padding: spacing.md },
  clubHeader: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  clubAvatar: { width: 52, height: 52, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  clubName: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  clubDesc: { fontSize: 14, marginTop: 2, lineHeight: 18 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start" },
  badgeText: { fontSize: 11, fontWeight: "600" },
  sectionTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 0.2 },
  membersSection: { marginTop: spacing.sm },
  memberChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, marginRight: 8 },
  memberInitial: { fontSize: 13, fontWeight: "700" },
  memberName: { fontSize: 12, fontWeight: "500", maxWidth: 80 },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  chatRowText: { fontSize: 15, fontWeight: "600", flex: 1 },
  pendingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: spacing.sm },
  pendingActions: { flexDirection: "row", gap: spacing.xs },
  pendingBtn: { minWidth: 80 },
  annHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  annAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  annAuthor: { fontSize: 13, fontWeight: "700" },
  annContent: { fontSize: 14, lineHeight: 20 },
});

export default ClubInfoScreen;
