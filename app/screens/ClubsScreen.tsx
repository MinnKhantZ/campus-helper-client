import { View, StyleSheet, FlatList, RefreshControl, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useGetAllClubsQuery, useGetMyClubsQuery, useRequestJoinMutation } from "../api/Club";
import type { ClubItem } from "../types";
import GlassCard from "../components/ui/GlassCard";
import GlassButton from "../components/ui/GlassButton";
import AnimatedListItem from "../components/ui/AnimatedListItem";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import { useTheme, spacing, radius, shadow } from "../theme";
import { useSelector } from "react-redux";
import type { RootState } from "../store";

type NavType = { navigate: (screen: string, params?: unknown) => void };

const ClubRow = ({
  club, onPress, onJoin, isJoined, isPending,
}: {
  club: ClubItem; onPress: () => void; onJoin: () => void; isJoined: boolean; isPending: boolean;
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 14, stiffness: 280 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14, stiffness: 280 }); }}
        activeOpacity={1}
      >
        <GlassCard style={styles.card}>
          <View style={styles.cardInner}>
            <View style={[styles.avatar, { backgroundColor: theme.chip }]}>
              <Icon name="account-group" size={22} color={theme.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={[styles.clubName, { color: theme.text }]} numberOfLines={1}>{club.name}</Text>
              {club.description ? (
                <Text style={[styles.clubDesc, { color: theme.textMuted }]} numberOfLines={2}>{club.description}</Text>
              ) : null}
              <View style={[styles.badge, { backgroundColor: theme.chip }]}>
                <Icon name="account-multiple" size={12} color={theme.primary} />
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {(club.student_ids?.length || 0) + (club.admin_id ? 1 : 0)} members
                </Text>
              </View>
            </View>
            {isJoined ? (
              <View style={[styles.joinedPill, { borderColor: theme.success }]}>
                <Icon name="check" size={14} color={theme.success} />
                <Text style={[styles.joinedText, { color: theme.success }]}>Joined</Text>
              </View>
            ) : (
              <GlassButton
                title={isPending ? "Requested" : "Join"}
                onPress={onJoin}
                disabled={isPending}
                variant="primary"
                style={styles.joinBtn}
              />
            )}
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const AllClubsTab = () => {
  const nav = useNavigation() as unknown as NavType;
  const { data, isLoading, refetch, isFetching } = useGetAllClubsQuery();
  const [requestJoin, { isLoading: joining }] = useRequestJoinMutation();
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useTheme();

  const handleJoin = useCallback(async (id: number) => {
    try { await requestJoin(id).unwrap(); } catch (e) { console.warn(e); }
  }, [requestJoin]);

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: "transparent" }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={data || []}
      keyExtractor={(i) => String(i.id)}
      renderItem={({ item, index }) => {
        const isJoined = !!user && (item.admin_id === user.id || item.student_ids?.includes(user.id));
        const isPending = !!user && item.pending_ids?.includes(user.id);
        return (
          <AnimatedListItem index={index}>
            <ClubRow
              club={item}
              onPress={() => nav.navigate("ClubInfo", { id: item.id })}
              onJoin={() => handleJoin(item.id)}
              isJoined={!!isJoined}
              isPending={!!isPending}
            />
          </AnimatedListItem>
        );
      }}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching || joining} onRefresh={refetch} tintColor={theme.primary} />}
    />
  );
};

const JoinedClubsTab = () => {
  const nav = useNavigation() as unknown as NavType;
  const { data, isLoading, refetch, isFetching } = useGetMyClubsQuery();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: "transparent" }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={data || []}
      keyExtractor={(i) => String(i.id)}
      renderItem={({ item, index }) => (
        <AnimatedListItem index={index}>
          <ClubRow
            club={item}
            onPress={() => nav.navigate("ClubInfo", { id: item.id })}
            onJoin={() => {}}
            isJoined={true}
            isPending={false}
          />
        </AnimatedListItem>
      )}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={theme.primary} />}
    />
  );
};

const ClubsScreen = () => {
  const nav = useNavigation() as unknown as NavType;
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<"All" | "Joined">("All");

  const tabs = ["All", "Joined"] as const;

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 160 }}
          style={styles.header}
        >
          <Text style={[styles.headerTitle, { color: theme.text }]}>Clubs</Text>
        </MotiView>

        {/* Tab Pills */}
        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              style={[
                styles.tabPill,
                {
                  backgroundColor: activeTab === tab ? theme.primary : theme.chip,
                  borderColor: activeTab === tab ? theme.primary : theme.border,
                },
              ]}
            >
              <Text style={[styles.tabLabel, { color: activeTab === tab ? theme.textInverse : theme.textMuted }]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === "All" ? <AllClubsTab /> : <JoinedClubsTab />}
        </View>

        <FloatingActionButton onPress={() => nav.navigate("ClubForm")} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tabRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 14, fontWeight: "600" },
  list: { padding: spacing.md, paddingBottom: 120 },
  card: { marginBottom: spacing.sm },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  clubName: { fontSize: 15, fontWeight: "700" },
  clubDesc: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  joinedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  joinedText: { fontSize: 12, fontWeight: "600" },
  joinBtn: { paddingHorizontal: 0, minWidth: 80 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});

export default ClubsScreen;
