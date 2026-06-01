import React from 'react';
import { MotiView } from 'moti';

interface AnimatedListItemProps {
  children: React.ReactNode;
  index?: number;
}

/**
 * Wraps a list item in a staggered fade+slide-up entrance.
 * Pass `index` to stagger multiple items.
 */
const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ children, index = 0 }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'spring',
        delay: index * 60,
        damping: 18,
        stiffness: 180,
      }}
    >
      {children}
    </MotiView>
  );
};

export default AnimatedListItem;
