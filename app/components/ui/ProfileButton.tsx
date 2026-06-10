import { type ViewStyle, type StyleProp } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '../../theme';
import type { RootStackParamList } from '../../Navigation';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
}

const ProfileButton = ({ style }: ProfileButtonProps) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={() => navigation.navigate('Profile')}
      onPressIn={() => { scale.value = withSpring(0.88, { damping: 12, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
      activeOpacity={1}
      style={[style, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel="Go to profile"
    >
      <Icon name="account-circle-outline" size={24} color={theme.text} />
    </AnimatedTouchable>
  );
};

export default ProfileButton;
