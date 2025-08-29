import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import EventCard from "./EventCard";
import { useGetAllEventsQuery } from "../api/Event";
import { scheduleEventNotification } from "../utils/notiService";
import type { EventItem } from "../types";

const EventList = () => {
  const { data, refetch } = useGetAllEventsQuery();
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

  return (
    <FlatList
      data={data as EventItem[] | undefined}
      renderItem={({ item }) => <EventCard {...item} />}
      keyExtractor={(item) => String(item.id)}
      style={styles.listContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    width: "100%",
  },
});

export default EventList;
