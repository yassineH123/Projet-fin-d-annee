import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';

export default function RideDetailsScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation();

  const handleBook = () => {
    Alert.alert('Confirmation', 'Réserver 1 place pour 30 DH ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', onPress: () =>
          Alert.alert('✅ Réservé !', 'Votre trajet a été confirmé.', [
            { text: 'OK', onPress: () => navigation.navigate('Home' as never) },
          ]) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.backArrow, { color: currentColors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Détails du trajet</Text>
        <View style={styles.ph} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.priceBanner, { backgroundColor: currentColors.primary }]}>
          <View>
            <Text style={styles.bannerLabel}>Date du trajet</Text>
            <Text style={styles.bannerDate}>Aujourd'hui, 14:00</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.bannerLabel}>Prix</Text>
            <Text style={styles.bannerPrice}>30 DH</Text>
          </View>
        </View>

        {/* Itinéraire */}
        <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          <Text style={[styles.cardTitle, { color: currentColors.text }]}>Itinéraire</Text>
          <View style={styles.tlRow}>
            <Text style={[styles.tlTime, { color: currentColors.text }]}>14:00</Text>
            <View style={styles.tlMid}>
              <View style={[styles.dot, { backgroundColor: currentColors.primary }]} />
              <View style={[styles.line, { backgroundColor: currentColors.border }]} />
            </View>
            <View style={styles.tlRight}>
              <Text style={[styles.tlCity, { color: currentColors.text }]}>Casablanca</Text>
              <Text style={[styles.tlAddr, { color: currentColors.textSecondary }]}>Gare Casa Voyageurs</Text>
            </View>
          </View>
          <View style={styles.tlRow}>
            <Text style={[styles.tlTime, { color: currentColors.text }]}>15:30</Text>
            <View style={styles.tlMid}>
              <View style={[styles.dot, { backgroundColor: currentColors.secondary }]} />
            </View>
            <View style={styles.tlRight}>
              <Text style={[styles.tlCity, { color: currentColors.text }]}>Rabat</Text>
              <Text style={[styles.tlAddr, { color: currentColors.textSecondary }]}>Gare Rabat Agdal</Text>
            </View>
          </View>
        </View>

        {/* Conducteur */}
        <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          <Text style={[styles.cardTitle, { color: currentColors.text }]}>Conducteur</Text>
          <View style={styles.driverRow}>
            <View style={[styles.driverAvatar, { backgroundColor: currentColors.primaryLight }]}>
              <Text style={[styles.driverInitial, { color: currentColors.primary }]}>Y</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.driverName, { color: currentColors.text }]}>Youssef M.</Text>
              <Text style={[styles.driverMeta, { color: currentColors.textSecondary }]}>⭐ 4.8 / 5  ·  120 avis</Text>
            </View>
            <TouchableOpacity
              style={[styles.msgBtn, { backgroundColor: currentColors.primaryLight }]}
              onPress={() => navigation.navigate('Messages' as never)}
            >
              <Text style={[styles.msgBtnText, { color: currentColors.primary }]}>💬 Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Véhicule */}
        <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          <Text style={[styles.cardTitle, { color: currentColors.text }]}>Véhicule</Text>
          <View style={styles.vehicleRow}>
            <Text style={styles.vehicleIcon}>🚗</Text>
            <View>
              <Text style={[styles.vehicleName, { color: currentColors.text }]}>Peugeot 208</Text>
              <Text style={[styles.vehicleColor, { color: currentColors.textSecondary }]}>Blanche · 3 places disponibles</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.bookBtn, { backgroundColor: currentColors.primary }]} onPress={handleBook} activeOpacity={0.9}>
          <Text style={styles.bookBtnText}>Réserver 1 place — 30 DH</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backArrow: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ph: { width: 26 },
  scrollContent: { padding: 20, paddingBottom: 48, gap: 16 },
  priceBanner: { borderRadius: 22, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  bannerDate: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bannerPrice: { color: '#fff', fontSize: 28, fontWeight: '900' },
  card: { borderRadius: 20, borderWidth: 1, padding: 20 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 18 },
  tlRow: { flexDirection: 'row', minHeight: 64 },
  tlTime: { width: 56, fontSize: 15, fontWeight: '700' },
  tlMid: { width: 24, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, marginTop: 2 },
  tlRight: { flex: 1, paddingLeft: 14 },
  tlCity: { fontSize: 17, fontWeight: '700', marginBottom: 3 },
  tlAddr: { fontSize: 13 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  driverAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  driverInitial: { fontSize: 22, fontWeight: '700' },
  driverName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  driverMeta: { fontSize: 13 },
  msgBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  msgBtnText: { fontSize: 13, fontWeight: '700' },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vehicleIcon: { fontSize: 36 },
  vehicleName: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  vehicleColor: { fontSize: 13 },
  bookBtn: { height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  bookBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});