import { useEffect, useMemo, useState } from "react";
import { ScrollView, RefreshControl, View, Text, StyleSheet } from "react-native";
import EventCard from "./EventCard";
import { EventCardSkeleton } from "./ui/SkeletonLoader";
import { useGetAllEventsQuery } from "../api/Event";
import { scheduleEventNotification } from "../utils/notiService";
import { useTheme, spacing } from "../theme";
import type { EventItem } from "../types";

const EventList = () => {
  const { data, refetch, isLoading } = useGetAllEventsQuery();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const now = useMemo(() => new Date(), []);

  const { upcoming, past } = useMemo(() => {
    if (!data) return { upcoming: [], past: [] };
    const all = data as EventItem[];
    return {
      upcoming: all
        .filter((e) => new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      past: all
        .filter((e) => new Date(e.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    };
  }, [data, now]);

  useEffect(() => {
    if (upcoming.length) {
      upcoming.forEach((event) => {
        scheduleEventNotification(event);
      });
    }
  }, [upcoming]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.listContainer}>
        {[0, 1, 2].map((i) => (
          <EventCardSkeleton key={i} />
        ))}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.listContainer}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>Upcoming Events</Text>
          {upcoming.map((item) => (
            <EventCard key={item.id} {...item} />
          ))}
        </View>
      )}

      {past.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Past Events</Text>
          {past.map((item) => (
            <EventCard key={item.id} {...item} />
          ))}
        </View>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>No events found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    width: "100%",
  },
  content: {
    paddingTop: 8,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: spacing.md,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 15,
  },
});

export default EventList;

