import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/MainNavigator';

type SearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Search'>;

const suggestions = [
  { id: '1', from: 'Casablanca', to: 'Rabat', emoji: '📍' },
  { id: '2', from: 'Fès', to: 'Meknès', emoji: '📍' },
  { id: '3', from: 'Marrakech', to: 'Agadir', emoji: '📍' },
  { id: '4', from: 'Tanger', to: 'Tétouan', emoji: '📍' },
];

export default function SearchScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation<SearchScreenNavigationProp>();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const [focused, setFocused] = useState<'from' | 'to' | null>(null);

  const canSearch = from.trim() && to.trim();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Rechercher</Text>
        </View>

        <View style={{ padding: 16, gap: 12 }}>
          {/* From / To block */}
          <View style={[styles.routeBlock, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: currentColors.primary }]} />
              <TextInput
                style={[styles.routeInput, { color: currentColors.text }]}
                placeholder="Lieu de départ"
                placeholderTextColor={currentColors.textSecondary}
                value={from}
                onChangeText={setFrom}
                onFocus={() => setFocused('from')}
                onBlur={() => setFocused(null)}
              />
              {from ? <TouchableOpacity onPress={() => setFrom('')}><Text style={{ color: currentColors.textSecondary, fontSize: 18 }}>×</Text></TouchableOpacity> : null}
            </View>
            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, { backgroundColor: currentColors.secondary }]} />
              <TextInput
                style={[styles.routeInput, { color: currentColors.text }]}
                placeholder="Destination"
                placeholderTextColor={currentColors.textSecondary}
                value={to}
                onChangeText={setTo}
                onFocus={() => setFocused('to')}
                onBlur={() => setFocused(null)}
              />
              {to ? <TouchableOpacity onPress={() => setTo('')}><Text style={{ color: currentColors.textSecondary, fontSize: 18 }}>×</Text></TouchableOpacity> : null}
            </View>
          </View>

          {/* Date & Passengers */}
          <View style={styles.twoCol}>
            <View style={[styles.inputBox, styles.flex, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <Text style={styles.inputIcon}>📅</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="Aujourd'hui" placeholderTextColor={currentColors.textSecondary} value={date} onChangeText={setDate} />
            </View>
            <View style={[styles.inputBox, styles.flex, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <Text style={styles.inputIcon}>👤</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="1 passager" placeholderTextColor={currentColors.textSecondary} value={passengers} onChangeText={setPassengers} keyboardType="number-pad" />
            </View>
          </View>

          {/* Search button */}
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: canSearch ? currentColors.primary : currentColors.border }]}
            onPress={() => navigation.navigate('AllTrips')}
            disabled={!canSearch}
            activeOpacity={0.9}
          >
            <Text style={[styles.searchBtnText, { color: canSearch ? '#fff' : currentColors.textSecondary }]}>
              🔍  Rechercher
            </Text>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[styles.sugTitle, { color: currentColors.textSecondary }]}>TRAJETS POPULAIRES</Text>
          {suggestions.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sugItem, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
              onPress={() => { setFrom(s.from); setTo(s.to); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sugEmoji}>{s.emoji}</Text>
              <Text style={[styles.sugText, { color: currentColors.text }]}>{s.from}</Text>
              <Text style={[styles.sugArrow, { color: currentColors.textSecondary }]}>→</Text>
              <Text style={[styles.sugText, { color: currentColors.text }]}>{s.to}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  routeBlock: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  routeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 16 },
  twoCol: { flexDirection: 'row', gap: 12 },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, height: 52, gap: 10 },
  inputIcon: { fontSize: 18 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  searchBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  searchBtnText: { fontSize: 17, fontWeight: '700' },
  sugTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  sugItem: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 13, marginBottom: 10 },
  sugEmoji: { fontSize: 16 },
  sugText: { fontSize: 15, fontWeight: '600' },
  sugArrow: { fontSize: 14 },
});