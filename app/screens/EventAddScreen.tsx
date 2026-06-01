import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { MotiView } from "moti";
import DateTimePicker from "@react-native-community/datetimepicker";
import ScreenHeader from "../components/ScreenHeader";
import GlassCard from "../components/ui/GlassCard";
import GlassInput from "../components/ui/GlassInput";
import GlassButton from "../components/ui/GlassButton";
import { useCreateEventMutation } from "../api/Event";
import { useTheme, spacing, radius } from "../theme";

const EventAddScreen = ({ navigation }: { navigation: any }) => {
  const [title, setTitle] = useState("");
  const [place, setPlace] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [createEvent, { isLoading }] = useCreateEventMutation();
  const theme = useTheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate((prev) => new Date(selectedDate.setHours(prev.getHours(), prev.getMinutes())));
    }
  };

  const handleTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setDate((prev) => new Date(prev.setHours(selectedTime.getHours(), selectedTime.getMinutes())));
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) => d.toISOString().split("T")[0]!;

  const handleSubmit = async () => {
    if (!title || !description || !place) return;
    try {
      await createEvent({ title, description, date, place }).unwrap();
    } catch (err) {
      console.error("Error creating event: ", err);
    } finally {
      navigation.goBack();
    }
  };

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScreenHeader name="Add Event" navigation={navigation} />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 80, damping: 18, stiffness: 160 }}
          >
            <GlassCard style={styles.card}>
              <GlassInput
                label="Event Title"
                placeholder="e.g. Tech Talk 2026"
                value={title}
                onChangeText={setTitle}
              />
              <GlassInput
                label="Location"
                placeholder="e.g. Main Auditorium"
                value={place}
                onChangeText={setPlace}
              />
              <GlassInput
                label="Description"
                placeholder="Describe the event…"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={{ minHeight: 96, textAlignVertical: "top" }}
              />

              {/* Date & Time pickers */}
              <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>
                Date &amp; Time
              </Text>
              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.pickerBtn, { backgroundColor: theme.chip, borderColor: theme.border }]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.8}
                >
                  <Icon name="calendar-outline" size={16} color={theme.primary} />
                  <Text style={[styles.pickerText, { color: theme.primary }]}>
                    {formatDate(date)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pickerBtn, { backgroundColor: theme.chip, borderColor: theme.border }]}
                  onPress={() => setShowTimePicker(true)}
                  activeOpacity={0.8}
                >
                  <Icon name="clock-outline" size={16} color={theme.primary} />
                  <Text style={[styles.pickerText, { color: theme.primary }]}>
                    {formatTime(date)}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} />
              )}
              {showTimePicker && (
                <DateTimePicker value={date} mode="time" display="default" onChange={handleTimeChange} />
              )}
            </GlassCard>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "spring", delay: 180, damping: 18, stiffness: 160 }}
          >
            <GlassButton
              title="Save Event"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={!title || !description || !place}
              style={styles.saveBtn}
            />
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  pickerRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pickerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  saveBtn: {
    marginHorizontal: 0,
  },
});

export default EventAddScreen;