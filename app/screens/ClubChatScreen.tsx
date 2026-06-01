import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useEffect, useRef, useState } from "react";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useGetClubMessagesQuery, useSendClubMessageMutation } from "../api/Message";
import type { ClubMessage } from "../types";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import { useTheme, spacing, radius } from "../theme";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const ClubChatScreen = () => {
  const route = useRoute();
  const nav = useNavigation() as { goBack: () => void };
  const params = (route as unknown as { params?: Record<string, unknown> }).params || {};
  const id = Number(params.id);
  const { data, isFetching, refetch } = useGetClubMessagesQuery({ clubId: id });
  const [sendMessage, { isLoading }] = useSendClubMessageMutation();
  const [text, setText] = useState("");
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useTheme();
  const listRef = useRef<FlatList>(null);
  const backScale = useSharedValue(1);
  const backAnim = useAnimatedStyle(() => ({ transform: [{ scale: backScale.value }] }));

  useEffect(() => {
    const interval = setInterval(() => { refetch(); }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const onSend = async () => {
    if (!text.trim()) return;
    const msg = text.trim();
    setText("");
    try {
      await sendMessage({ clubId: id, content: msg }).unwrap();
      refetch();
    } catch {
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const renderItem = ({ item, index }: { item: ClubMessage; index: number }) => {
    const isMe = !!user && item.user_id === user.id;
    const authorName = item.author ? item.author.name : String("User #") + String(item.user_id);
    const initial = (item.author?.name || "U").slice(0, 1).toUpperCase();

    return (
      <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", delay: Math.min(index * 30, 300) }}
        style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}
      >
        {!isMe && (
          <View style={[styles.avatar, { backgroundColor: theme.chip }]}>
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
              isMe
                ? { backgroundColor: theme.primary + "E6" }
                : undefined,
            ]}
            intensity={isMe ? 0 : 20}
          >
            <Text style={[styles.bubbleText, { color: isMe ? "#fff" : theme.text }]}>
              {item.content}
            </Text>
          </GlassCard>
          {item.createdAt ? (
            <Text style={[styles.timestamp, { color: theme.textMuted }]}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          ) : null}
        </View>
        {isMe && (
          <View style={[styles.avatar, { backgroundColor: theme.primary + "33" }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
          </View>
        )}
      </MotiView>
    );
  };

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

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            ref={listRef}
            data={data || []}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            refreshing={isFetching}
            onRefresh={refetch}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          />

          <View style={[styles.inputBar, { borderTopColor: theme.border, backgroundColor: theme.surfaceSolid + "CC" }]}>
            <GlassInput
              placeholder="Type a message..."
              value={text}
              onChangeText={setText}
              style={styles.input}
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
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
  messageRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: spacing.sm, gap: spacing.xs },
  messageRowMe: { justifyContent: "flex-end" },
  messageRowOther: { justifyContent: "flex-start" },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700" },
  authorName: { fontSize: 11, fontWeight: "600", marginBottom: 3, marginLeft: 4 },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.lg },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  timestamp: { fontSize: 10, marginTop: 4, marginHorizontal: 4 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
  },
  input: { flex: 1 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
});

export default ClubChatScreen;
