import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type PublishScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Publish'>;

export default function PublishScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation<PublishScreenNavigationProp>();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.backArrow, { color: currentColors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Proposer un trajet</Text>
        <View style={styles.ph} />
      </View>

      <View style={styles.content}>
        <View style={[styles.illustrationBox, { backgroundColor: currentColors.primaryLight }]}>
          <Text style={styles.illustrationEmoji}>🚗</Text>
        </View>
        <Text style={[styles.title, { color: currentColors.text }]}>Devenez conducteur AtlasWay</Text>
        <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
          Partagez vos frais de route en proposant vos places vides à des passagers.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>💰</Text>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: currentColors.text }]}>Économisez</Text>
              <Text style={[styles.benefitDesc, { color: currentColors.textSecondary }]}>Réduisez vos frais de péage et de carburant.</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>🤝</Text>
            <View style={styles.benefitText}>
              <Text style={[styles.benefitTitle, { color: currentColors.text }]}>Partagez</Text>
              <Text style={[styles.benefitDesc, { color: currentColors.textSecondary }]}>Rencontrez des personnes intéressantes.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.publishBtn, { backgroundColor: currentColors.primary }]}
          onPress={() => navigation.navigate('PublishTrip')}
          activeOpacity={0.9}
        >
          <Text style={styles.publishBtnText}>Commencer la publication</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backArrow: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ph: { width: 26 },
  content: { flex: 1, alignItems: 'center', padding: 28 },
  illustrationBox: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginTop: 24, marginBottom: 32 },
  illustrationEmoji: { fontSize: 60 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.3 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 23, marginBottom: 40, paddingHorizontal: 16 },
  benefits: { width: '100%', gap: 24, marginBottom: 40 },
  benefitItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  benefitIcon: { fontSize: 30, marginTop: 2 },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  benefitDesc: { fontSize: 14, lineHeight: 20 },
  publishBtn: { width: '100%', height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 'auto', elevation: 5, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  publishBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});