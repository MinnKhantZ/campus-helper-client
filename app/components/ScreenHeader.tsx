import { View, Text, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { TouchableOpacity } from "react-native-gesture-handler";
import { AntDesign } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "../theme";
import { useColorScheme } from "react-native";

interface Props {
  name: string;
  navigation: { navigate: (s: string) => void; goBack: () => void };
  screen?: string;
}

const ScreenHeader = ({ name, navigation, screen }: Props) => {
  const theme = useTheme();
  const scheme = useColorScheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (screen) {
      navigation.navigate(screen);
    } else {
      navigation.goBack();
    }
  };

  const content = (
    <View style={[styles.inner, Platform.OS === "ios" && styles.iosPadding]}>
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handlePress}
          onPressIn={() => { scale.value = withSpring(0.85, { damping: 12, stiffness: 300 }); }}
          onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
          activeOpacity={1}
        >
          <View style={[styles.backCircle, { backgroundColor: theme.chip }]}>
            <AntDesign name="arrow-left" color={theme.primary} size={20} />
          </View>
        </TouchableOpacity>
      </Animated.View>
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
        {name}
      </Text>
      {/* Spacer to keep title centered */}
      <View style={styles.backBtn} />
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <BlurView
        intensity={theme.tabBarBlur}
        tint={scheme === "dark" ? "dark" : "light"}
        style={[styles.container, { borderBottomColor: theme.border }]}
      >
        {content}
      </BlurView>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surfaceSolid, borderBottomColor: theme.border },
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iosPadding: {
    paddingTop: 48,
  },
  backBtn: {
    width: 40,
  },
  backCircle: {
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
});

export default ScreenHeader;

