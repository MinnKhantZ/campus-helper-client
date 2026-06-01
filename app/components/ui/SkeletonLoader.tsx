import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../theme';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const theme = useTheme();

  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 900,
        repeatReverse: true,
      }}
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.skeleton,
        },
        style,
      ]}
    />
  );
};

/** Renders a full card-shaped skeleton placeholder */
export const EventCardSkeleton: React.FC = () => {
  const theme = useTheme();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={skeletonStyles.row}>
        <SkeletonLoader width="55%" height={18} borderRadius={6} />
        <SkeletonLoader width={60} height={14} borderRadius={6} />
      </View>
      <SkeletonLoader width="35%" height={14} borderRadius={6} style={{ marginTop: 10 }} />
      <SkeletonLoader width="90%" height={12} borderRadius={6} style={{ marginTop: 8 }} />
      <SkeletonLoader width="70%" height={12} borderRadius={6} style={{ marginTop: 6 }} />
    </View>
  );
};

const skeletonStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default SkeletonLoader;
