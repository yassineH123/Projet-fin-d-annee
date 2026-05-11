import React from 'react';
import { View, ViewProps, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { radii, spacing } from '../../theme/spacing';

interface CardProps extends ViewProps {
  elevated?: boolean;
  padding?: keyof typeof spacing | number;
  style?: StyleProp<ViewStyle>;
}

export function Card({
  elevated = true,
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  const { currentColors } = useThemeStore();
  
  const paddingValue = typeof padding === 'string' ? spacing[padding] : padding;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: currentColors.surface,
          borderColor: currentColors.border,
          padding: paddingValue,
        },
        elevated && {
          shadowColor: currentColors.cardShadow,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 4,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1,
  },
});
