import React from 'react';
import { View, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { spacing, radii } from '../../theme/spacing';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

export default function SettingsScreen() {
  const { theme, toggleTheme, currentColors } = useThemeStore();
  const { logout, user } = useAuthStore();
  const navigation = useNavigation();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={currentColors.primary} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Paramètres</Typography>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Section: Préférences */}
        <View style={styles.section}>
          <Typography variant="captionSemibold" color={currentColors.textSecondary} style={styles.sectionLabel}>
            PRÉFÉRENCES
          </Typography>
          <Card padding={0} elevated={false} style={{ overflow: 'hidden' }}>
            
            {/* Mode Sombre */}
            <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: currentColors.border }]}>
              <View style={[styles.iconBox, { backgroundColor: currentColors.primaryLight }]}>
                <Feather name="moon" size={20} color={currentColors.primary} />
              </View>
              <Typography variant="bodySemibold" style={styles.rowLabel}>Mode Sombre</Typography>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: currentColors.border, true: currentColors.primary }}
                thumbColor="#fff"
              />
            </View>

            {/* Paramètres de chat */}
            <TouchableOpacity style={styles.row} onPress={() => {/* Navigation placeholder */}}>
              <View style={[styles.iconBox, { backgroundColor: currentColors.primaryLight }]}>
                <Feather name="message-circle" size={20} color={currentColors.primary} />
              </View>
              <Typography variant="bodySemibold" style={styles.rowLabel}>Paramètres de chat</Typography>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

          </Card>
        </View>

        {/* Section: Sécurité & Confidentialité */}
        <View style={styles.section}>
          <Typography variant="captionSemibold" color={currentColors.textSecondary} style={styles.sectionLabel}>
            SÉCURITÉ & CONFIDENTIALITÉ
          </Typography>
          <Card padding={0} elevated={false} style={{ overflow: 'hidden' }}>
            
            {/* Sécurité */}
            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: currentColors.border }]} onPress={() => navigation.navigate('Security' as never)}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Feather name="lock" size={20} color="#10B981" />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold">Sécurité</Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>Changer le mot de passe, 2FA</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

            {/* Confidentialité */}
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Privacy' as never)}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Feather name="shield" size={20} color="#F59E0B" />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold">Confidentialité</Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>Gestion de vos données</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

          </Card>
        </View>

        {/* Section: Compte */}
        <View style={styles.section}>
          <Typography variant="captionSemibold" color={currentColors.textSecondary} style={styles.sectionLabel}>
            COMPTE
          </Typography>
          <Card padding={0} elevated={false} style={{ overflow: 'hidden' }}>
            
            {/* Profile */}
            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: currentColors.border }]} onPress={() => navigation.navigate('Profile' as never)}>
              <View style={[styles.iconBox, { backgroundColor: currentColors.primaryLight }]}>
                <Feather name="user" size={20} color={currentColors.primary} />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>{user?.email}</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

            {/* Logout */}
            <TouchableOpacity style={styles.row} onPress={logout}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Feather name="log-out" size={20} color={currentColors.error} />
              </View>
              <Typography variant="bodySemibold" color={currentColors.error} style={styles.rowLabel}>
                Déconnexion
              </Typography>
            </TouchableOpacity>
            
          </Card>
        </View>

        {/* App version */}
        <Typography variant="caption" color={currentColors.textSecondary} style={styles.version}>
          AtlasWay v1.0.0
        </Typography>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: { padding: spacing.xs },
  headerPlaceholder: { width: 32 },

  scrollContent: {
    paddingVertical: spacing.md,
  },

  section: { 
    marginTop: spacing.lg, 
    paddingHorizontal: spacing.md 
  },
  sectionLabel: {
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowContent: { flex: 1 },
  rowLabel: { flex: 1 },
  
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },

  version: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
});
