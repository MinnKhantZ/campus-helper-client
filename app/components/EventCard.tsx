import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import Colors from "../constants/Colors";
import { useState } from "react";
import { useDeleteEventMutation } from "../api/Event";
import type { EventItem } from "../types";

const EventCard = (event: EventItem) => {
  const [showDelete, setShowDelete] = useState(false);
  const [deleteEvent] = useDeleteEventMutation();

  const date = new Date(event.date);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  const handleLongPress = () => setShowDelete(true);
  const handlePress = () => setShowDelete(false);

  const handleDelete = async () => {
    Alert.alert("Confirm Delete", "Are you sure?", [
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
    <TouchableOpacity onLongPress={handleLongPress} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.dateTime}>
            <Text style={styles.date}>{formatDate(date)}</Text>
            <Text style={styles.time}>{formatTime(date)}</Text>
          </View>
        </View>
        <View style={styles.body}>
          <Text style={styles.place}>{event.place}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>
        {showDelete && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "90%",
    alignSelf: "center",
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.primary,
  },
  body: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  dateTime: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    maxWidth: "70%",
  },
  date: {
    fontSize: 14,
    color: Colors.white,
  },
  time: {
    fontSize: 14,
    color: Colors.white,
  },
  place: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: Colors.black,
  },
  deleteButton: {
    backgroundColor: "red",
    padding: 8,
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default EventCard;
