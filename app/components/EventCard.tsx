import { View, Text, StyleSheet, Alert, NativeSyntheticEvent, TextLayoutEventData } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { MotiView } from "moti";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useState, useMemo, useCallback } from "react";
import { useDeleteEventMutation } from "../api/Event";
import GlassCard from "./ui/GlassCard";
import { useTheme, spacing, radius } from "../theme";
import type { EventItem } from "../types";

const EventCard = (event: EventItem) => {
  const [showDelete, setShowDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState<boolean | null>(null);
  const [deleteEvent] = useDeleteEventMutation();
  const theme = useTheme();

  const handleMeasure = useCallback(
    ({ nativeEvent: { lines } }: NativeSyntheticEvent<TextLayoutEventData>) => {
      setIsTruncatable(lines.length > 2);
    },
    []
  );

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const date = useMemo(() => new Date(event.date), [event.date]);
  const isPast = date < new Date();

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
    <Animated.View style={[styles.wrapper, animatedStyle, isPast && { opacity: 0.6 }]}>
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
          <View style={[styles.accentBar, { backgroundColor: isPast ? theme.textMuted : theme.primary }]} />

          <View style={styles.content}>
            <View style={[styles.dateBadge, { backgroundColor: isPast ? theme.border : theme.chip }]}>
              <Text style={[styles.dateDay, { color: isPast ? theme.textMuted : theme.primary }]}>
                {date.getDate()}
              </Text>
              <Text style={[styles.dateMonth, { color: isPast ? theme.textMuted : theme.primary }]}>
                {date.toLocaleDateString([], { month: "short" }).toUpperCase()}
              </Text>
            </View>

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
              {isPast && (
                <View style={styles.pastChip}>
                  <Text style={[styles.pastChipText, { color: theme.textMuted }]}>Past</Text>
                </View>
              )}
              {event.description ? (
                <>
                  <Text
                    style={[styles.description, styles.measurer, { color: theme.textMuted }]}
                    pointerEvents="none"
                    onTextLayout={handleMeasure}
                  >
                    {event.description}
                  </Text>
                  <Text
                    style={[styles.description, { color: theme.textMuted }]}
                    numberOfLines={isTruncatable && !expanded ? 2 : undefined}
                  >
                    {event.description}
                  </Text>
                  {isTruncatable && (
                    <TouchableOpacity
                      onPress={() => setExpanded((p) => !p)}
                      style={styles.toggleBtn}
                    >
                      <Text style={[styles.toggleText, { color: theme.primary }]}>
                        {expanded ? "Show less" : "Show more"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : null}
            </View>
          </View>

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
  measurer: {
    position: "absolute",
    opacity: 0,
  },
  pastChip: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.3)",
  },
  toggleBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pastChipText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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

