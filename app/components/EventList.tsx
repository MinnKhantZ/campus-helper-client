import { useEffect, useState } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import EventCard from "./EventCard";
import AnimatedListItem from "./ui/AnimatedListItem";
import { EventCardSkeleton } from "./ui/SkeletonLoader";
import { useGetAllEventsQuery } from "../api/Event";
import { scheduleEventNotification } from "../utils/notiService";
import type { EventItem } from "../types";

const EventList = () => {
  const { data, refetch, isLoading } = useGetAllEventsQuery();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      (data as EventItem[]).forEach((event) => {
        scheduleEventNotification(event);
      });
    }
  }, [data]);

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
    <FlatList
      data={data as EventItem[] | undefined}
      renderItem={({ item, index }) => (
        <AnimatedListItem index={index}>
          <EventCard {...item} />
        </AnimatedListItem>
      )}
      keyExtractor={(item) => String(item.id)}
      style={styles.listContainer}
      contentContainerStyle={styles.content}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
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
});

export default EventList;

