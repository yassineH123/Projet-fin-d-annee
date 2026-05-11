import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

export default function ChangePasswordScreen({ navigation }: any) {
  const { currentColors } = useThemeStore();
  const { changePassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Succès', 'Mot de passe mis à jour.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de changer le mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={currentColors.primary} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Changer le mot de passe</Typography>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.container}>
        <Card>
          <TextInput
            placeholder="Mot de passe actuel"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={[styles.input, { borderColor: currentColors.border }]}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />

          <TextInput
            placeholder="Nouveau mot de passe"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={[styles.input, { borderColor: currentColors.border }]}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TextInput
            placeholder="Confirmer le nouveau mot de passe"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            style={[styles.input, { borderColor: currentColors.border }]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: currentColors.primary }]} onPress={submit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Typography variant="bodySemibold" style={{ color: '#fff' }}>Enregistrer</Typography>}
          </TouchableOpacity>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { height: 60, alignItems: 'center', flexDirection: 'row', paddingHorizontal: 12, borderBottomWidth: 1 },
  backBtn: { width: 40 },
  headerPlaceholder: { width: 40 },
  container: { padding: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, color: '#111' },
  button: { padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
});
