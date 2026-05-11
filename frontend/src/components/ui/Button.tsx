import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { radii, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = true,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const { currentColors } = useThemeStore();

  const getBackgroundColor = () => {
    if (disabled) return currentColors.border;
    switch (variant) {
      case 'primary': return currentColors.primary;
      case 'secondary': return currentColors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return currentColors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return currentColors.textSecondary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#FFFFFF';
      case 'outline': return currentColors.primary;
      case 'ghost': return currentColors.primary;
      default: return '#FFFFFF';
    }
  };

  const getBorderColor = () => {
    if (disabled) return currentColors.border;
    if (variant === 'outline') return currentColors.primary;
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 48;
      case 'lg': return 56;
      default: return 48;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          height: getHeight(),
          width: fullWidth ? '100%' : 'auto',
          paddingHorizontal: fullWidth ? 0 : spacing.lg,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text
            style={[
              typography.bodySemibold,
              { color: getTextColor(), marginLeft: icon ? spacing.sm : 0 },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
