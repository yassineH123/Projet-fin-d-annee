import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🧭',
    title: 'Bienvenue sur AtlasWay',
    subtitle: 'La plateforme de covoiturage intelligente au Maroc.',
    bg: '#2563EB',
  },
  {
    id: '2',
    emoji: '🚗',
    title: 'Trouvez un trajet',
    subtitle: 'Des milliers de conducteurs prêts à vous emmener à destination.',
    bg: '#0891B2',
  },
  {
    id: '3',
    emoji: '💰',
    title: 'Économisez ensemble',
    subtitle: 'Partagez vos frais de route et réduisez votre empreinte carbone.',
    bg: '#059669',
  },
];

interface OnboardingScreenProps {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const { currentColors } = useThemeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleDone = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    onDone();
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      handleDone();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboardingDone', 'true');
    onDone();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={[styles.skipText, { color: currentColors.textSecondary }]}>Passer</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.emojiBox, { backgroundColor: item.bg }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
            </View>
            <Text style={[styles.title, { color: currentColors.text }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor: currentColors.primary }]}
            />
          );
        })}
      </View>

      {/* Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentColors.primary }]}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? "C'est parti !" : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  skipBtn: { alignSelf: 'flex-end', padding: 20 },
  skipText: { fontSize: 15, fontWeight: '600' },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  emojiBox: {
    width: 140, height: 140, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 48,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12,
  },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 16, letterSpacing: -0.5 },
  subtitle: { fontSize: 17, textAlign: 'center', lineHeight: 26 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 32 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
  nextBtn: {
    height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  nextBtnText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
