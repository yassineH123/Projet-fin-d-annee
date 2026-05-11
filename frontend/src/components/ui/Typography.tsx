import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { useThemeStore } from '../../store/themeStore';

export type TypographyVariant = keyof typeof typography;

interface CustomTypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export function Typography({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...props
}: CustomTypographyProps) {
  const { currentColors } = useThemeStore();
  
  const textStyle = [
    typography[variant],
    { color: color || currentColors.text, textAlign: align },
    style,
  ];

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
}
