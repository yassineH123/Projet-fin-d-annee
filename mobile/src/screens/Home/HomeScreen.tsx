import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const { user, setUser } = useAuth();

  const logout = () => setUser(null);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#020617' }} contentContainerStyle={{ padding: 24 }}>
      <View style={{ marginTop: 20 }}>
        <Text style={{ color: '#60a5fa', letterSpacing: 3, fontWeight: '800', fontSize: 12, marginBottom: 8 }}>
          ATLASWAY
        </Text>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900', marginBottom: 4 }}>
          Bonjour, {user?.firstName} 👋
        </Text>
        <Text style={{ color: '#94a3b8', fontSize: 15, marginBottom: 32 }}>
          Prêt pour votre prochain voyage ?
        </Text>

        {/* Quick actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: '#1e3a5f', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#2563eb' }}>
            <Text style={{ color: '#60a5fa', fontSize: 22, marginBottom: 8 }}>🔍</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Trouver un trajet</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Rechercher un covoiturage</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#14532d', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#16a34a' }}>
            <Text style={{ color: '#4ade80', fontSize: 22, marginBottom: 8 }}>🚗</Text>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Proposer un trajet</Text>
            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>Partager votre route</Text>
          </View>
        </View>

        {/* Profile summary */}
        <View style={{ backgroundColor: '#111827', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e293b', marginBottom: 24 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 12 }}>Mon profil</Text>
          <Text style={{ color: '#94a3b8', fontSize: 13 }}>Email : {user?.email}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>Rôle : {user?.role}</Text>
        </View>

        <Pressable
          onPress={logout}
          style={{ backgroundColor: '#1e293b', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}
        >
          <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>Se déconnecter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
