import { TouchableOpacity, type ViewStyle, type StyleProp } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { RootStackParamList } from '../../Navigation';

interface ProfileButtonProps {
  style?: StyleProp<ViewStyle>;
}

const ProfileButton = ({ style }: ProfileButtonProps) => {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Profile')}
      activeOpacity={0.7}
      style={style}
    >
      <Icon name="account-circle-outline" size={24} color={theme.text} />
    </TouchableOpacity>
  );
};

export default ProfileButton;
