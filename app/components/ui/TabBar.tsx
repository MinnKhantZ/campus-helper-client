import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../theme';

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Events: { active: 'calendar', inactive: 'calendar-outline' },
  TimeTable: { active: 'clock', inactive: 'clock-outline' },
  Map: { active: 'map-marker', inactive: 'map-marker-outline' },
  Marketplace: { active: 'shopping', inactive: 'shopping-outline' },
  Clubs: { active: 'account-group', inactive: 'account-group-outline' },
};

const TabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const theme = useTheme();
  const scheme = useColorScheme();

  return (
    <View style={styles.wrapper}>
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={theme.tabBarBlur}
          tint={scheme === 'dark' ? 'dark' : 'light'}
          style={[styles.container, { borderColor: theme.border }]}
        >
          <TabBarContent
            state={state}
            descriptors={descriptors}
            navigation={navigation}
            theme={theme}
          />
        </BlurView>
      ) : (
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surfaceSolid, borderColor: theme.border },
          ]}
        >
          <TabBarContent
            state={state}
            descriptors={descriptors}
            navigation={navigation}
            theme={theme}
          />
        </View>
      )}
    </View>
  );
};

type ContentProps = Pick<BottomTabBarProps, 'state' | 'descriptors' | 'navigation'> & {
  theme: ReturnType<typeof useTheme>;
};

const TabBarContent: React.FC<ContentProps> = ({ state, descriptors, navigation, theme }) => {
  return (
    <View style={styles.inner}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]!;
        const isFocused = state.index === index;
        const icons = TAB_ICONS[route.name] ?? { active: 'circle', inactive: 'circle-outline' };

        return (
          <TabItem
            key={route.key}
            routeName={route.name}
            label={options.tabBarLabel as string ?? route.name}
            isFocused={isFocused}
            icons={icons}
            theme={theme}
            onPress={() => {
              if (!isFocused) {
                navigation.navigate(route.name);
              }
            }}
          />
        );
      })}
    </View>
  );
};

interface TabItemProps {
  routeName: string;
  label: string;
  isFocused: boolean;
  icons: { active: string; inactive: string };
  theme: ReturnType<typeof useTheme>;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ label, isFocused, icons, theme, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 12, stiffness: 350 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 350 });
  };

  const iconName = (isFocused ? icons.active : icons.inactive) as any;
  const color = isFocused ? theme.primary : theme.textMuted;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        {isFocused && (
          <View style={[styles.activePill, { backgroundColor: theme.chip }]} />
        )}
        <Icon name={iconName} size={24} color={color} />
      </Animated.View>
      <Text
        style={[
          styles.label,
          { color, fontWeight: isFocused ? '600' : '400' },
        ]}
        numberOfLines={1}
      >
        {label === 'TimeTable' ? 'Schedule' : label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  container: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  iconWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 36,
  },
  activePill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});

export default TabBar;
