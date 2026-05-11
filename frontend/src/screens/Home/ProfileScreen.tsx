import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, currentColors } = useThemeStore();
  const isDark = theme === 'dark';

  const stats = [
    { label: 'Trajets', value: '12' },
    { label: 'Avis', value: '4.9 ⭐' },
    { label: 'Km parcourus', value: '830' },
  ];

  const menuItems = [
    { emoji: '📋', label: 'Mes trajets', onPress: () => navigation.navigate('AllTrips' as never) },
    { emoji: '⭐', label: 'Mes avis', onPress: () => navigation.navigate('Reviews' as never) },
    { emoji: '⚙️', label: 'Paramètres', onPress: () => navigation.navigate('Settings' as never) },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header Banner */}
        <View style={[styles.banner, { backgroundColor: currentColors.primary }]}>
          <Text style={styles.bannerApp}>AtlasWay</Text>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.bannerName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.bannerEmail}>{user?.email}</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsRow, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statItem, i < stats.length - 1 && { borderRightWidth: 1, borderRightColor: currentColors.border }]}>
              <Text style={[styles.statValue, { color: currentColors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Dark mode toggle inline */}
        <View style={[styles.section, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          <View style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: currentColors.primaryLight }]}>
              <Text style={styles.iconEmoji}>🌙</Text>
            </View>
            <Text style={[styles.rowLabel, { color: currentColors.text }]}>Mode Sombre</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: currentColors.border, true: currentColors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.section, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.row, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: currentColors.primaryLight }]}>
                <Text style={styles.iconEmoji}>{item.emoji}</Text>
              </View>
              <Text style={[styles.rowLabel, { color: currentColors.text }]}>{item.label}</Text>
              <Text style={[styles.chevron, { color: currentColors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: currentColors.error + '15', borderColor: currentColors.error + '40' }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={[styles.logoutText, { color: currentColors.error }]}>Déconnexion</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: currentColors.textSecondary }]}>AtlasWay v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  banner: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  bannerApp: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 2, marginBottom: 20 },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarEmoji: { color: '#fff', fontSize: 32, fontWeight: '800' },
  bannerName: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  bannerEmail: { color: 'rgba(255,255,255,0.75)', fontSize: 14 },

  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
    marginBottom: 16,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600' },

  section: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 16, gap: 14,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  iconEmoji: { fontSize: 20 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
  chevron: { fontSize: 22 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 24,
    borderRadius: 16, borderWidth: 1,
    paddingVertical: 16, gap: 10,
  },
  logoutIcon: { fontSize: 20 },
  logoutText: { fontSize: 16, fontWeight: '700' },

  version: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
});
