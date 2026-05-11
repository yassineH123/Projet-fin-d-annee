import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';

const mockReviews = [
  { id: '1', author: 'Youssef M.', rating: 5, date: 'Il y a 2 jours', comment: 'Super trajet ! Conducteur ponctuel et très sympathique. La voiture était propre.', avatar: '👨' },
  { id: '2', author: 'Fatima Z.', rating: 4, date: 'La semaine dernière', comment: 'Très bon voyage, un peu de retard au départ mais bien rattrapé.', avatar: '👩' },
  { id: '3', author: 'Karim A.', rating: 5, date: 'Il y a 1 mois', comment: 'Conduite prudente et bonne ambiance. Je recommande vivement !', avatar: '👨' },
];

function EmptyReviews({ colors }: { colors: any }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.emoji}>⭐</Text>
      <Text style={[emptyStyles.title, { color: colors.text }]}>Aucun avis pour l'instant</Text>
      <Text style={[emptyStyles.subtitle, { color: colors.textSecondary }]}>
        Vos avis apparaîtront ici après vos premiers trajets.
      </Text>
    </View>
  );
}
const emptyStyles = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 100, paddingHorizontal: 32 },
  emoji: { fontSize: 60, marginBottom: 20 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});

export default function ReviewsScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');

  // Summary
  const avgRating = (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1);

  const renderItem = ({ item }: { item: typeof mockReviews[0] }) => (
    <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
      <View style={styles.cardTop}>
        <View style={styles.authorRow}>
          <View style={[styles.avatar, { backgroundColor: currentColors.primaryLight }]}>
            <Text style={styles.avatarEmoji}>{item.avatar}</Text>
          </View>
          <View>
            <Text style={[styles.authorName, { color: currentColors.text }]}>{item.author}</Text>
            <Text style={[styles.date, { color: currentColors.textSecondary }]}>{item.date}</Text>
          </View>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: currentColors.primaryLight }]}>
          <Text style={[styles.ratingText, { color: currentColors.primary }]}>⭐ {item.rating}/5</Text>
        </View>
      </View>
      <Text style={[styles.comment, { color: currentColors.textSecondary }]}>{item.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.back, { color: currentColors.primary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Avis</Text>
        <View style={styles.ph} />
      </View>

      {/* Summary banner */}
      <View style={[styles.summaryBanner, { backgroundColor: currentColors.primary }]}>
        <Text style={styles.summaryRating}>{avgRating}</Text>
        <Text style={styles.summaryStars}>{'⭐'.repeat(Math.round(parseFloat(avgRating)))}</Text>
        <Text style={styles.summaryCount}>Basé sur {mockReviews.length} avis</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        {(['received', 'given'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomWidth: 2, borderBottomColor: currentColors.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? currentColors.primary : currentColors.textSecondary }]}>
              {tab === 'received' ? 'Reçus' : 'Donnés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={activeTab === 'received' ? mockReviews : []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyReviews colors={currentColors} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  back: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ph: { width: 26 },
  summaryBanner: { padding: 24, alignItems: 'center' },
  summaryRating: { color: '#fff', fontSize: 48, fontWeight: '900', lineHeight: 52 },
  summaryStars: { fontSize: 22, marginTop: 8, marginBottom: 6 },
  summaryCount: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 15, fontWeight: '700' },
  list: { padding: 16, gap: 14, paddingBottom: 40 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 22 },
  authorName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  date: { fontSize: 12 },
  ratingBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  ratingText: { fontSize: 13, fontWeight: '700' },
  comment: { fontSize: 14, lineHeight: 21 },
});