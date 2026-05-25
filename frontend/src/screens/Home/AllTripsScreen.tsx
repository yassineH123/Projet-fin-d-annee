import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';

type AllTripsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AllTrips'>;

import { getAllTrips } from '../../services/trips';

type Trip = {
  id: string;
  from: string;
  to: string;
  date?: string;
  price?: string;
  driver?: string;
  rating?: number;
  seats?: number;
};

// Skeleton row
function SkeletonRow({ colors }: { colors: any }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[sk.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: anim }]}>
      <View style={[sk.line, sk.w80, { backgroundColor: colors.border }]} />
      <View style={[sk.line, sk.w50, { backgroundColor: colors.border }]} />
      <View style={[sk.line, sk.w30, { backgroundColor: colors.border }]} />
    </Animated.View>
  );
}
const sk = StyleSheet.create({
  card: { borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1, gap: 10 },
  line: { height: 13, borderRadius: 8 },
  w80: { width: '80%' }, w50: { width: '50%' }, w30: { width: '30%' },
});

export default function AllTripsScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation<AllTripsScreenNavigationProp>();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('Tous');
  const [trips, setTrips] = React.useState<Trip[]>([]);
  const filters = ['Tous', 'Aujourd\'hui', 'Demain', 'Prix ↑', 'Note ↑'];

  useEffect(() => { fetchTrips(); }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await getAllTrips();
      setTrips(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTrips().finally(() => setRefreshing(false));
  }, []);

  const renderItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
      onPress={() => navigation.navigate('RideDetails')}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <View style={styles.routeRow}>
          <View style={[styles.dot, { backgroundColor: currentColors.primary }]} />
          <Text style={[styles.city, { color: currentColors.text }]}>{item.from}</Text>
          <Text style={[styles.arrow, { color: currentColors.textSecondary }]}>  →  </Text>
          <View style={[styles.dot, { backgroundColor: currentColors.secondary }]} />
          <Text style={[styles.city, { color: currentColors.text }]}>{item.to}</Text>
        </View>
        <View style={[styles.priceTag, { backgroundColor: currentColors.primaryLight }]}>
          <Text style={[styles.priceText, { color: currentColors.primary }]}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.chipsRow}>
        <Text style={[styles.chip, { backgroundColor: currentColors.background, color: currentColors.textSecondary }]}>📅 {item.date}</Text>
        <Text style={[styles.chip, { backgroundColor: currentColors.background, color: currentColors.textSecondary }]}>💺 {item.seats} pl.</Text>
        <Text style={[styles.chip, { backgroundColor: currentColors.background, color: currentColors.textSecondary }]}>⭐ {item.rating}</Text>
      </View>

      <View style={[styles.footer, { borderTopColor: currentColors.border }]}>
        <View style={styles.driverRow}>
          <View style={[styles.badge, { backgroundColor: currentColors.primaryLight }]}>
            <Text style={[styles.initial, { color: currentColors.primary }]}>{item.driver?.charAt(0) || '?'}</Text>
          </View>
          <Text style={[styles.driverName, { color: currentColors.text }]}>{item.driver}</Text>
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: currentColors.primary }]} onPress={() => navigation.navigate('RideDetails')}>
          <Text style={styles.btnText}>Voir →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.back, { color: currentColors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Tous les trajets</Text>
        <View style={styles.ph} />
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={filters}
        keyExtractor={(f) => f}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, { backgroundColor: activeFilter === f ? currentColors.primary : currentColors.surface, borderColor: activeFilter === f ? currentColors.primary : currentColors.border }]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, { color: activeFilter === f ? '#fff' : currentColors.textSecondary }]}>{f}</Text>
          </TouchableOpacity>
        )}
      />

      {loading ? (
        <View style={{ padding: 16 }}>
          {[1, 2, 3].map(i => <SkeletonRow key={i} colors={currentColors} />)}
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentColors.primary} colors={[currentColors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: currentColors.text }]}>Aucun trajet trouvé</Text>
              <Text style={[styles.emptySubtitle, { color: currentColors.textSecondary }]}>Essayez de modifier vos filtres.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  back: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ph: { width: 26 },
  filterList: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: { borderRadius: 22, borderWidth: 1, padding: 18, marginBottom: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  city: { fontSize: 16, fontWeight: '700' },
  arrow: { fontSize: 14 },
  priceTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceText: { fontSize: 14, fontWeight: '800' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { fontSize: 12, fontWeight: '600', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  initial: { fontSize: 14, fontWeight: '700' },
  driverName: { fontSize: 14, fontWeight: '600' },
  btn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});