import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface AppLogoProps {
  size?: number;
  lineColor?: string;
  circleColor?: string;
  backgroundColor?: string;
}

export default function AppLogo({
  size = 140,
  backgroundColor = 'transparent',
}: AppLogoProps) {
  return (
    <View style={[styles.frame, { width: size, height: size, backgroundColor }]}>
      <Image
        source={require('../../../assets/1.png')}
        style={[styles.image, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});