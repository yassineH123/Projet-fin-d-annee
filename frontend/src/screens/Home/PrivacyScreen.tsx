import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Feather from '@expo/vector-icons/Feather';

import { useThemeStore } from '../../store/themeStore';
import { spacing, radii } from '../../theme/spacing';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

type PrivacyOption = {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  description: string;
  value: boolean;
};

export default function PrivacyScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation();

  const [options, setOptions] = useState<PrivacyOption[]>([
    {
      id: 'location',
      icon: 'map-pin',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#3B82F6',
      label: 'Partage de localisation',
      description: 'Autoriser l'app à accéder à votre position',
      value: true,
    },
    {
      id: 'profile_visibility',
      icon: 'eye',
      iconBg: 'rgba(139, 92, 246, 0.15)',
      iconColor: '#8B5CF6',
      label: 'Profil public',
      description: 'Rendre votre profil visible à tous',
      value: true,
    },
    {
      id: 'activity_status',
      icon: 'activity',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#10B981',
      label: 'Statut d'activité',
      description: 'Afficher votre statut en ligne',
      value: false,
    },
    {
      id: 'data_analytics',
      icon: 'bar-chart-2',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#F59E0B',
      label: 'Données analytiques',
      description: 'Aider à améliorer l'application',
      value: true,
    },
    {
      id: 'personalized_ads',
      icon: 'target',
      iconBg: 'rgba(239, 68, 68, 0.15)',
      iconColor: '#EF4444',
      label: 'Publicités personnalisées',
      description: 'Recevoir des annonces ciblées',
      value: false,
    },
    {
      id: 'contact_sync',
      icon: 'users',
      iconBg: 'rgba(20, 184, 166, 0.15)',
      iconColor: '#14B8A6',
      label: 'Synchronisation contacts',
      description: 'Retrouver vos amis sur AtlasWay',
      value: false,
    },
  ]);

  const toggle = (id: string) => {
    setOptions(prev =>
      prev.map(opt => (opt.id === id ? { ...opt, value: !opt.value } : opt))
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Supprimer mes données',
      'Êtes-vous sûr de vouloir demander la suppression de toutes vos données ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Demande envoyée', 'Votre demande a été soumise. Vous recevrez un email de confirmation.'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={currentColors.primary} />
        </TouchableOpacity>
        <Typography variant="h3" style={{ flex: 1, textAlign: 'center' }}>Confidentialité</Typography>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
          <Feather name="shield" size={20} color="#F59E0B" />
          <Typography variant="caption" color="#B45309" style={{ flex: 1, marginLeft: spacing.sm }}>
            Vos données sont protégées conformément au RGPD. Vous pouvez modifier vos préférences à tout moment.
          </Typography>
        </View>

        {/* Toggles */}
        <View style={styles.section}>
          <Typography variant="captionSemibold" color={currentColors.textSecondary} style={styles.sectionLabel}>
            PRÉFÉRENCES DE CONFIDENTIALITÉ
          </Typography>
          <Card padding={0} elevated={false} style={{ overflow: 'hidden' }}>
            {options.map((opt, index) => (
              <View
                key={opt.id}
                style={[
                  styles.row,
                  index < options.length - 1 && { borderBottomWidth: 1, borderBottomColor: currentColors.border },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: opt.iconBg }]}>
                  <Feather name={opt.icon as any} size={20} color={opt.iconColor} />
                </View>
                <View style={styles.rowContent}>
                  <Typography variant="bodySemibold">{opt.label}</Typography>
                  <Typography variant="caption" color={currentColors.textSecondary}>{opt.description}</Typography>
                </View>
                <Switch
                  value={opt.value}
                  onValueChange={() => toggle(opt.id)}
                  trackColor={{ false: currentColors.border, true: currentColors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </Card>
        </View>

        {/* Actions légales */}
        <View style={styles.section}>
          <Typography variant="captionSemibold" color={currentColors.textSecondary} style={styles.sectionLabel}>
            DROITS & DONNÉES
          </Typography>
          <Card padding={0} elevated={false} style={{ overflow: 'hidden' }}>

            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
              onPress={() => Alert.alert('Exporter', 'Votre archive de données sera envoyée par email sous 48h.')}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Feather name="download" size={20} color="#3B82F6" />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold">Exporter mes données</Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>Télécharger une copie de vos données</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: currentColors.border }]}
              onPress={() => Alert.alert('Politique', 'Ouverture de la politique de confidentialité.')}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                <Feather name="file-text" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold">Politique de confidentialité</Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>Lire nos engagements</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.row} onPress={handleDeleteData}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Feather name="trash-2" size={20} color="#EF4444" />
              </View>
              <View style={styles.rowContent}>
                <Typography variant="bodySemibold" color="#EF4444">Supprimer mes données</Typography>
                <Typography variant="caption" color={currentColors.textSecondary}>Action irréversible</Typography>
              </View>
              <Feather name="chevron-right" size={20} color={currentColors.textSecondary} />
            </TouchableOpacity>

          </Card>
        </View>

        <Typography variant="caption" color={currentColors.textSecondary} style={styles.footer}>
          Dernière mise à jour : Mai 2026
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
  scrollContent: { paddingVertical: spacing.md },
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
});
