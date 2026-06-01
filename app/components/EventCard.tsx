import { View, Text, StyleSheet, Alert } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useState } from "react";
import { useDeleteEventMutation } from "../api/Event";
import GlassCard from "./ui/GlassCard";
import { useTheme, spacing, radius } from "../theme";
import type { EventItem } from "../types";

const EventCard = (event: EventItem) => {
  const [showDelete, setShowDelete] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();
  const theme = useTheme();

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const date = new Date(event.date);
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { month: "short", day: "numeric" });

  const handleLongPress = () => setShowDelete(true);
  const handlePress = () => setShowDelete(false);

  const handleDelete = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(event.id).unwrap();
            setShowDelete(false);
          } catch (err) {
            console.error("Delete failed", err);
          }
        },
      },
    ]);
  };

  return (
    <Animated.View style={[styles.wrapper, animatedStyle]}>
      <TouchableOpacity
        onLongPress={handleLongPress}
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 300 });
        }}
        activeOpacity={1}
      >
        <GlassCard style={styles.card}>
          {/* Left accent bar */}
          <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

          <View style={styles.content}>
            {/* Date badge */}
            <View style={[styles.dateBadge, { backgroundColor: theme.chip }]}>
              <Text style={[styles.dateDay, { color: theme.primary }]}>
                {date.getDate()}
              </Text>
              <Text style={[styles.dateMonth, { color: theme.primary }]}>
                {date.toLocaleDateString([], { month: "short" }).toUpperCase()}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                {event.title}
              </Text>
              <View style={styles.meta}>
                <Icon name="map-marker-outline" size={13} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textMuted }]} numberOfLines={1}>
                  {event.place}
                </Text>
              </View>
              <View style={styles.meta}>
                <Icon name="clock-outline" size={13} color={theme.textMuted} />
                <Text style={[styles.metaText, { color: theme.textMuted }]}>
                  {formatDate(date)} · {formatTime(date)}
                </Text>
              </View>
              {event.description ? (
                <Text style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
                  {event.description}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Delete reveal */}
          {showDelete && (
            <MotiView
              from={{ opacity: 0, translateY: -8 }}
              animate={{ opacity: 1, translateY: 0 }}
              style={[styles.deleteBar, { backgroundColor: theme.errorBg }]}
            >
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Icon name="trash-can-outline" size={16} color={theme.error} />
                <Text style={[styles.deleteText, { color: theme.error }]}>Delete Event</Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.md,
    marginVertical: 6,
  },
  card: {
    overflow: "hidden",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  accentBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    paddingLeft: 20,
    gap: spacing.md,
  },
  dateBadge: {
    width: 44,
    height: 52,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    flex: 1,
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  deleteBar: {
    borderTopWidth: 1,
    borderTopColor: "rgba(220,38,38,0.15)",
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export default EventCard;

