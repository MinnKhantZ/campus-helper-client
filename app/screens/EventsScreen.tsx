import { StyleSheet, View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import EventList from "../components/EventList";
import { useTheme, spacing, radius } from "../theme";

const EventsScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const fabScale = useSharedValue(1);

  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

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
        <Text style={[styles.heading, { color: theme.text }]}>Events</Text>
        <Text style={[styles.subheading, { color: theme.textMuted }]}>
          Upcoming campus events
        </Text>
      </MotiView>

      {/* Event List */}
      <EventList />

      {/* FAB */}
      <Animated.View style={[styles.fab, fabStyle]}>
        <TouchableOpacity
          onPress={() => navigation.navigate("EventAdd")}
          onPressIn={() => {
            fabScale.value = withSpring(0.88, { damping: 12, stiffness: 300 });
          }}
          onPressOut={() => {
            fabScale.value = withSpring(1, { damping: 12, stiffness: 300 });
          }}
          activeOpacity={1}
        >
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            style={styles.fabGradient}
          >
            <Icon name="plus" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
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
  heading: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  subheading: {
    fontSize: 14,
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: spacing.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default EventsScreen;

