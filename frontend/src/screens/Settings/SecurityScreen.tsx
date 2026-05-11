import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

import { useThemeStore } from '../../store/themeStore';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

export default function SecurityScreen({ navigation }: any) {
  const { currentColors } = useThemeStore();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={currentColors.primary} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Sécurité</Typography>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.container}>
        <Card>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ChangePassword' as never)}>
            <Typography variant="bodySemibold">Changer le mot de passe</Typography>
            <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={() => { /* TODO: enable 2FA */ }}>
            <Typography variant="bodySemibold">Activer l'authentification à deux facteurs</Typography>
            <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
});
