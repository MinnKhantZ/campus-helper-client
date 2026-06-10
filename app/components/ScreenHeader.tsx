import { View, Text, StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme, spacing } from "../theme";

interface Props {
  name: string;
  navigation: { goBack: () => void };
}

const ScreenHeader = ({ name, navigation }: Props) => {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.topBar}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          onPressIn={() => { scale.value = withSpring(0.85, { damping: 12, stiffness: 300 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
          style={[styles.backBtn, { backgroundColor: theme.chip }]}
          activeOpacity={1}
        >
          <Icon name="arrow-left" size={20} color={theme.primary} />
        </TouchableOpacity>
      </Animated.View>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {name}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  spacer: {
    width: 36,
  },
});

export default ScreenHeader;

