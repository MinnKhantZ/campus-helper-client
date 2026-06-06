import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
  type KeyboardEvent,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useEffect, useRef, useState, useCallback, memo } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGetClubMessagesQuery, useSendClubMessageMutation } from "../api/Message";
import type { ClubMessage } from "../types";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import { useTheme, spacing, radius } from "../theme";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const GROUP_TIME_MS = 2 * 60 * 1000;

const MessageItem = memo(({
  item,
  isMe,
  authorName,
  initial,
  theme,
  isGroupEnd,
}: {
  item: ClubMessage;
  isMe: boolean;
  authorName: string;
  initial: string;
  theme: ReturnType<typeof useTheme>;
  isGroupEnd: boolean;
}) => {
  const avatarBg = isMe ? theme.primary + "33" : theme.chip;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", delay: 0 }}
      style={isGroupEnd ? styles.groupEnd : styles.groupMid}
    >
      <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
          </View>
        )}
        <View style={{ maxWidth: "72%", alignItems: isMe ? "flex-end" : "flex-start" }}>
          {!isMe && (
            <Text style={[styles.authorName, { color: theme.textMuted }]}>{authorName}</Text>
          )}
          <GlassCard
            style={[
              styles.bubble,
              isMe ? { backgroundColor: theme.primary + "E6" } : undefined,
            ]}
            intensity={isMe ? 0 : 20}
          >
            <Text style={[styles.bubbleText, { color: isMe ? "#fff" : theme.text }]}>
              {item.content}
            </Text>
          </GlassCard>
        </View>
        {isMe && (
          <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
          </View>
        )}
      </View>
      {isGroupEnd && item.createdAt ? (
        <Text style={[styles.timestamp, { color: theme.textMuted, textAlign: isMe ? "right" : "left", marginHorizontal: 44 }]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      ) : null}
    </MotiView>
  );
});

MessageItem.displayName = "MessageItem";

const ClubChatScreen = () => {
  const route = useRoute();
  const nav = useNavigation() as { goBack: () => void };
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const id = Number(params.id);
  const { data, isFetching, refetch } = useGetClubMessagesQuery({ clubId: id });
  const [sendMessage, { isLoading }] = useSendClubMessageMutation();
  const [text, setText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);
  const listRef = useRef<FlatList>(null);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => setKbHeight(e.endCoordinates.height);
    const onHide = () => setKbHeight(0);
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      onShow,
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      onHide,
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const backScale = useSharedValue(1);
  const backAnim = useAnimatedStyle(() => ({ transform: [{ scale: backScale.value }] }));

  useEffect(() => {
    const interval = setInterval(() => { refetch(); }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  useEffect(() => {
    const count = data?.length ?? 0;
    if (count > prevCountRef.current) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
    prevCountRef.current = count;
  }, [data]);

  const onSend = useCallback(async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    try {
      await sendMessage({ clubId: id, content: msg }).unwrap();
      refetch();
    } catch {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  }, [text, id, sendMessage, refetch]);

  const renderItem = useCallback(({ item, index }: { item: ClubMessage; index: number }) => {
    const isMe = !!user && item.user_id === user.id;
    const authorName = item.author ? item.author.name : String("User #") + String(item.user_id);
    const initial = (item.author?.name || "U").slice(0, 1).toUpperCase();
    const messages = data || [];
    const next = messages[index + 1];
    const isGroupEnd = !next
      || next.user_id !== item.user_id
      || !!(item.createdAt && next.createdAt && new Date(next.createdAt).getTime() - new Date(item.createdAt).getTime() > GROUP_TIME_MS);
    return (
      <MessageItem
        item={item}
        isMe={isMe}
        authorName={authorName}
        initial={initial}
        theme={theme}
        isGroupEnd={isGroupEnd}
      />
    );
  }, [user, theme, data]);

  const keyExtractor = useCallback((item: ClubMessage) => String(item.id), []);

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Animated.View style={backAnim}>
            <TouchableOpacity
              onPressIn={() => { backScale.value = withSpring(0.85, { damping: 12, stiffness: 300 }); }}
              onPressOut={() => { backScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
              onPress={() => nav.goBack()}
              style={[styles.backBtn, { backgroundColor: theme.chip }]}
              activeOpacity={1}
            >
              <Icon name="arrow-left" size={20} color={theme.primary} />
            </TouchableOpacity>
          </Animated.View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Club Chat</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={{ flex: 1 }}>
          {isFetching && !data ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
          <FlatList
            ref={listRef}
            data={data || []}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshing={isRefreshing}
            onRefresh={async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); }}
            contentContainerStyle={styles.list}
            removeClippedSubviews={false}
            maxToRenderPerBatch={10}
            windowSize={7}
          />
          )}

          <View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.surfaceSolid, paddingBottom: spacing.sm + insets.bottom, marginBottom: kbHeight }]}>
            <GlassInput
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              containerStyle={{ flex: 1, marginBottom: 0 }}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            <TouchableOpacity
              onPress={onSend}
              disabled={!text.trim() || isLoading}
              style={[styles.sendBtn, { backgroundColor: text.trim() ? theme.primary : theme.chip }]}
              activeOpacity={0.8}
            >
              <Icon name="send" size={20} color={text.trim() ? "#fff" : theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  gradient: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", textAlign: "center" },
  backBtn: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, paddingBottom: 12 },
  messageRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  groupEnd: { marginBottom: spacing.sm },
  groupMid: { marginBottom: 2 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700" },
  authorName: { fontSize: 11, fontWeight: "600", marginBottom: 3, marginLeft: 4 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, marginTop: 0, marginHorizontal: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});

export default ClubChatScreen;
