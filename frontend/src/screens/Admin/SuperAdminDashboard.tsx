import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from '@expo/vector-icons/Feather';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { apiFetch } from '../../utils/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'active' | 'suspended';
}

interface TabItem {
  key: 'users' | 'admins';
  label: string;
  icon: string;
}

export default function SuperAdminDashboard() {
  const { currentColors } = useThemeStore();
  const { logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(`${title}\n\n${message}`)) {
        onConfirm();
      }
      return;
    }

    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: onConfirm },
    ]);
  };

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const [usersData, adminsData] = await Promise.all([
        apiFetch('/superadmin/users', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiFetch('/superadmin/admins', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAdmins(Array.isArray(adminsData) ? adminsData : []);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteUser = (userId: string, userName: string) => {
    confirmAction('Supprimer utilisateur', `Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`, async () => {
      try {
        const response = await apiFetch(`/superadmin/users/${userId}`, {
          method: 'DELETE',
        });

        showMessage('Succès', response?.message || 'Utilisateur supprimé');
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : 'Erreur lors de la suppression');
      }
    });
  };

  const handleToggleSuspendUser = async (userId: string, userName: string, currentStatus: string) => {
    const action = currentStatus === 'suspended' ? 'réactiver' : 'suspendre';
    const endpoint = currentStatus === 'suspended' ? 'unsuspend' : 'suspend';

    confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} utilisateur`, `Êtes-vous sûr de vouloir ${action} ${userName} ?`, async () => {
      try {
        const response = await apiFetch(`/superadmin/users/${userId}/${endpoint}`, {
          method: 'PATCH',
        });

        showMessage('Succès', response?.message || `Utilisateur ${action}u`);
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : `Erreur lors de l'action`);
      }
    });
  };

  const handleDeleteAdmin = (adminId: string, adminName: string) => {
    confirmAction('Supprimer admin', `Êtes-vous sûr de vouloir supprimer l'admin ${adminName} ? Cette action est irréversible.`, async () => {
      try {
        const response = await apiFetch(`/superadmin/admins/${adminId}`, {
          method: 'DELETE',
        });

        showMessage('Succès', response?.message || 'Admin supprimé');
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : 'Erreur lors de la suppression');
      }
    });
  };

  const handleToggleSuspendAdmin = async (adminId: string, adminName: string, currentStatus: string) => {
    const action = currentStatus === 'suspended' ? 'réactiver' : 'suspendre';
    const endpoint = currentStatus === 'suspended' ? 'unsuspend' : 'suspend';

    confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} admin`, `Êtes-vous sûr de vouloir ${action} ${adminName} ?`, async () => {
      try {
        const response = await apiFetch(`/superadmin/admins/${adminId}/${endpoint}`, {
          method: 'PATCH',
        });

        showMessage('Succès', response?.message || `Admin ${action}u`);
        await fetchData();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : `Erreur lors de l'action`);
      }
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  const tabs: TabItem[] = [
    { key: 'users', label: 'Utilisateurs', icon: 'users' },
    { key: 'admins', label: 'Admins', icon: 'shield' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayData = activeTab === 'users' ? users : admins;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.title, { color: currentColors.text }]}>Super Admin</Text>
          <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
            Gérez tout le système
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: currentColors.primary }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && [styles.activeTab, { borderBottomColor: currentColors.primary }],
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Feather name={tab.icon} size={18} color={activeTab === tab.key ? currentColors.primary : currentColors.textSecondary} />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? currentColors.primary : currentColors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchData();
            }}
            tintColor={currentColors.primary}
          />
        }
        renderItem={({ item }) => {
          const userStatus = item.status || 'active';
          return (
            <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <View style={styles.cardInfo}>
                <View style={[styles.avatar, { backgroundColor: currentColors.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: currentColors.primary }]}>
                    {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.details}>
                  <Text style={[styles.name, { color: currentColors.text }]}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={[styles.email, { color: currentColors.textSecondary }]}>
                    {item.email}
                  </Text>
                  <View style={styles.badgesContainer}>
                    <View style={[styles.roleBadge, { backgroundColor: activeTab === 'admins' ? '#3B82F6' : '#10B981' }]}>
                      <Text style={styles.roleText}>{item.role}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: userStatus === 'suspended' ? '#FCA5A5' : '#D1FAE5' }]}>
                      <Text style={[styles.statusText, { color: userStatus === 'suspended' ? '#7F1D1D' : '#065F46' }]}>
                        {userStatus === 'suspended' ? '🔒' : '✓'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: userStatus === 'suspended' ? '#10B981' : '#F59E0B' }]}
                  onPress={() => {
                    if (activeTab === 'admins') {
                      handleToggleSuspendAdmin(item.id, `${item.firstName} ${item.lastName}`, userStatus);
                    } else {
                      handleToggleSuspendUser(item.id, `${item.firstName} ${item.lastName}`, userStatus);
                    }
                  }}
                >
                  <Feather name={userStatus === 'suspended' ? 'unlock' : 'lock'} size={14} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => {
                    if (activeTab === 'admins') {
                      handleDeleteAdmin(item.id, `${item.firstName} ${item.lastName}`);
                    } else {
                      handleDeleteUser(item.id, `${item.firstName} ${item.lastName}`);
                    }
                  }}
                >
                  <Feather name="trash-2" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  logoutBtn: { padding: 10, borderRadius: 8 },
  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: 'transparent', gap: 8 },
  activeTab: { borderBottomWidth: 3 },
  tabLabel: { fontSize: 14, fontWeight: '600' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', fontSize: 14 },
  details: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  email: { fontSize: 13, marginBottom: 6 },
  badgesContainer: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  roleText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statusText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, borderRadius: 8 },
  listContent: { paddingVertical: 8 },
});