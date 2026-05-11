import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';

const mockMessages = [
  { id: '1', name: 'Youssef M.', avatar: '👨', lastMessage: "Bonjour, prenez-vous l'autoroute ?", time: '14:30', unread: true, trip: 'Casa → Rabat' },
  { id: '2', name: 'Fatima Z.', avatar: '👩', lastMessage: 'Parfait, on se voit demain à 9h.', time: 'Hier', unread: false, trip: 'Fès → Meknès' },
  { id: '3', name: 'Hassan B.', avatar: '👨', lastMessage: 'Je suis au point de rendez-vous.', time: 'Lun', unread: false, trip: 'Marrakech → Agadir' },
];

function EmptyMessages({ colors }: { colors: any }) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.emoji}>💬</Text>
      <Text style={[emptyStyles.title, { color: colors.text }]}>Aucun message</Text>
      <Text style={[emptyStyles.subtitle, { color: colors.textSecondary }]}>
        Réservez un trajet pour commencer à échanger avec un conducteur.
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

export default function MessagesScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation();

  const renderItem = ({ item }: { item: typeof mockMessages[0] }) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: currentColors.border }]} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: currentColors.primaryLight }]}>
        <Text style={styles.avatarEmoji}>{item.avatar}</Text>
        {item.unread && <View style={[styles.unreadDot, { backgroundColor: currentColors.primary }]} />}
      </View>
      <View style={styles.content}>
        <View style={styles.top}>
          <Text style={[styles.name, { color: currentColors.text, fontWeight: item.unread ? '800' : '600' }]}>{item.name}</Text>
          <Text style={[styles.time, { color: item.unread ? currentColors.primary : currentColors.textSecondary }]}>{item.time}</Text>
        </View>
        <Text style={[styles.trip, { color: currentColors.primary }]}>🚗 {item.trip}</Text>
        <Text style={[styles.lastMsg, { color: item.unread ? currentColors.text : currentColors.textSecondary, fontWeight: item.unread ? '600' : '400' }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <Text style={[styles.headerTitle, { color: currentColors.text }]}>Messages</Text>
        <View style={[styles.badge, { backgroundColor: currentColors.primary }]}>
          <Text style={styles.badgeText}>1</Text>
        </View>
      </View>

      <FlatList
        data={mockMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyMessages colors={currentColors} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  badge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  avatarEmoji: { fontSize: 26 },
  unreadDot: { position: 'absolute', top: 0, right: 0, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  content: { flex: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 16 },
  time: { fontSize: 12 },
  trip: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  lastMsg: { fontSize: 14, lineHeight: 20 },
});