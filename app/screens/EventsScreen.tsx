import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import EventList from "../components/EventList";
import FloatingActionButton from "../components/ui/FloatingActionButton";
import ProfileButton from "../components/ui/ProfileButton";
import { useTheme, spacing } from "../theme";

const EventsScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientMid, theme.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 200 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.heading, { color: theme.text }]}>Events</Text>
            <Text style={[styles.subheading, { color: theme.textMuted }]}>
              Upcoming campus events
            </Text>
          </View>
          <ProfileButton />
        </View>
      </MotiView>

      {/* Event List */}
      <EventList />

      <FloatingActionButton onPress={() => navigation.navigate("EventAdd")} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default EventsScreen;

