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

export default function AdminDashboard() {
  const { currentColors } = useThemeStore();
  const { logout } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
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

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const data = await apiFetch('/admin/users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = (userId: string, userName: string) => {
    confirmAction('Supprimer utilisateur', `Êtes-vous sûr de vouloir supprimer ${userName} ? Cette action est irréversible.`, async () => {
      try {
        const response = await apiFetch(`/admin/users/${userId}`, {
          method: 'DELETE',
        });

        showMessage('Succès', response?.message || 'Utilisateur supprimé');
        await fetchUsers();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : 'Erreur lors de la suppression');
      }
    });
  };

  const handleToggleSuspend = async (userId: string, userName: string, currentStatus: string) => {
    const action = currentStatus === 'suspended' ? 'réactiver' : 'suspendre';
    const endpoint = currentStatus === 'suspended' ? 'unsuspend' : 'suspend';

    confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} utilisateur`, `Êtes-vous sûr de vouloir ${action} ${userName} ?`, async () => {
      try {
        const response = await apiFetch(`/admin/users/${userId}/${endpoint}`, {
          method: 'PATCH',
        });

        showMessage('Succès', response?.message || `Utilisateur ${action}u`);
        await fetchUsers();
      } catch (error) {
        console.error('Error:', error);
        showMessage('Erreur', error instanceof Error ? error.message : `Erreur lors de l'action`);
      }
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={currentColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
        <View>
          <Text style={[styles.title, { color: currentColors.text }]}>Tableau de bord Admin</Text>
          <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
            Gérez {users.length} utilisateurs
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: currentColors.primary }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchUsers();
            }}
            tintColor={currentColors.primary}
          />
        }
        renderItem={({ item }) => {
          const userStatus = item.status || 'active';
          return (
            <View style={[styles.userCard, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: currentColors.primaryLight }]}>
                  <Text style={[styles.avatarText, { color: currentColors.primary }]}>
                    {item.firstName.charAt(0)}{item.lastName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.details}>
                  <Text style={[styles.userName, { color: currentColors.text }]}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={[styles.userEmail, { color: currentColors.textSecondary }]}>
                    {item.email}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: userStatus === 'suspended' ? '#FCA5A5' : '#D1FAE5' }]}>
                    <Text style={[styles.statusText, { color: userStatus === 'suspended' ? '#7F1D1D' : '#065F46' }]}>
                      {userStatus === 'suspended' ? '🔒 Suspendu' : '✓ Actif'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: userStatus === 'suspended' ? '#10B981' : '#F59E0B' }]}
                  onPress={() => handleToggleSuspend(item.id, `${item.firstName} ${item.lastName}`, userStatus)}
                >
                  <Feather name={userStatus === 'suspended' ? 'unlock' : 'lock'} size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleDeleteUser(item.id, `${item.firstName} ${item.lastName}`)}
                >
                  <Feather name="trash-2" size={16} color="#fff" />
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
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  userInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontWeight: '700', fontSize: 14 },
  details: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  userEmail: { fontSize: 13, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8, borderRadius: 8 },
  deleteBtn: { padding: 8, borderRadius: 8 },
  listContent: { paddingVertical: 8 },
});
