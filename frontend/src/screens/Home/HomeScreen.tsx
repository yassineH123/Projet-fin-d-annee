import React, { useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Animated, Image, Platform, useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';

import { RootStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { spacing, radii } from '../../theme/spacing';
import { Typography } from '../../components/ui/Typography';
import { Card } from '../../components/ui/Card';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

import { getAllTrips } from '../../services/trips';

type Trip = { id: string | number; from: string; to: string; date?: string; price?: string; driver?: string; seats?: number };

const defaultRecent: Trip[] = [];

function SkeletonCard() {
  const { currentColors } = useThemeStore();
  const anim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Card elevated={false} style={[styles.skeletonCard, { borderColor: currentColors.border }]}>
      <Animated.View style={{ opacity: anim }}>
        <View style={[styles.skeletonLine, { width: '80%', backgroundColor: currentColors.border, marginBottom: 12 }]} />
        <View style={[styles.skeletonLine, { width: '60%', backgroundColor: currentColors.border, marginBottom: 12 }]} />
        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: currentColors.border }]} />
      </Animated.View>
    </Card>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const { currentColors } = useThemeStore();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [recentRides, setRecentRides] = React.useState<Trip[]>(defaultRecent);

  // Pour centrer sur les grands écrans (tablette/web)
  const isLargeScreen = width > 768;
  const contentMaxWidth = isLargeScreen ? 600 : '100%';

  useEffect(() => {
    fetchRecent();
  }, []);

  const fetchRecent = async () => {
    setLoading(true);
    try {
      const data = await getAllTrips();
      if (Array.isArray(data)) setRecentRides(data.slice(0, 3));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 1500);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]} edges={['top', 'left', 'right']}>
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ width: contentMaxWidth, flex: 1 }}>
          
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
            <View>
              <Typography variant="small" color={currentColors.textSecondary} style={{ marginBottom: 4 }}>
                {greeting} 👋
              </Typography>
              <Typography variant="h2">
                {user?.firstName || 'Utilisateur'} {user?.lastName || ''}
              </Typography>
            </View>
            <TouchableOpacity
              style={[styles.avatarBtn, { backgroundColor: currentColors.primaryLight }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Typography variant="bodySemibold" color={currentColors.primary}>
                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || ''}
              </Typography>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={currentColors.primary}
                colors={[currentColors.primary]}
              />
            }
          >
            {/* Hero Search */}
            <TouchableOpacity
              style={[styles.searchHero, { backgroundColor: currentColors.primary }]}
              onPress={() => navigation.navigate('Search')}
              activeOpacity={0.9}
            >
              <Typography variant="small" style={styles.heroLabel}>ATLASWAY</Typography>
              <Typography variant="h1" style={styles.heroTitle}>Où allons-nous{'\n'}aujourd'hui ?</Typography>
              
              <View style={styles.searchBar}>
                <Feather name="search" size={20} color="#111827" style={{ marginRight: 12 }} />
                <Typography variant="bodySemibold" color="#6B7280" style={{ flex: 1 }}>
                  Rechercher une destination...
                </Typography>
              </View>
            </TouchableOpacity>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
              {[
                { label: 'Trajets', value: '15K+', icon: 'map' },
                { label: 'Conducteurs', value: '5K+', icon: 'users' },
                { label: 'Note moy.', value: '4.8', icon: 'star' },
              ].map((s, i) => (
                <Card key={i} elevated={false} padding="sm" style={styles.statCard}>
                  <Feather name={s.icon} size={22} color={currentColors.primary} style={{ marginBottom: 8 }} />
                  <Typography variant="subtitle">{s.value}</Typography>
                  <Typography variant="caption" color={currentColors.textSecondary}>{s.label}</Typography>
                </Card>
              ))}
            </View>

            {/* Popular Rides Section */}
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Typography variant="h3">Trajets populaires</Typography>
                <TouchableOpacity onPress={() => navigation.navigate('AllTrips')} style={{ padding: spacing.xs }}>
                  <Typography variant="bodySemibold" color={currentColors.primary}>Tout voir</Typography>
                </TouchableOpacity>
              </View>

              {loading
                ? [1, 2].map(i => <SkeletonCard key={i} />)
                : recentRides.map((ride) => (
                  <TouchableOpacity
                    key={ride.id}
                    onPress={() => navigation.navigate('RideDetails')}
                    activeOpacity={0.8}
                    style={{ marginBottom: spacing.md }}
                  >
                    <Card padding="lg">
                      {/* Top Row: Cities and Price */}
                      <View style={styles.rideTop}>
                        <View style={styles.routeRow}>
                          <View style={[styles.cityDot, { backgroundColor: currentColors.primary }]} />
                          <Typography variant="subtitle">{ride.from}</Typography>
                          <Feather name="arrow-right" size={16} color={currentColors.textSecondary} style={{ marginHorizontal: 8 }} />
                          <View style={[styles.cityDot, { backgroundColor: currentColors.secondary }]} />
                          <Typography variant="subtitle">{ride.to}</Typography>
                        </View>
                        <View style={[styles.priceTag, { backgroundColor: currentColors.primaryLight }]}>
                          <Typography variant="bodySemibold" color={currentColors.primary}>{ride.price}</Typography>
                        </View>
                      </View>

                      {/* Middle Row: Date & Seats */}
                      <View style={styles.rideInfo}>
                        <View style={[styles.infoChip, { backgroundColor: currentColors.background }]}>
                          <Feather name="calendar" size={14} color={currentColors.textSecondary} style={{ marginRight: 6 }} />
                          <Typography variant="captionSemibold" color={currentColors.textSecondary}>{ride.date}</Typography>
                        </View>
                        <View style={[styles.infoChip, { backgroundColor: currentColors.background }]}>
                          <Feather name="user" size={14} color={currentColors.textSecondary} style={{ marginRight: 6 }} />
                          <Typography variant="captionSemibold" color={currentColors.textSecondary}>{ride.seats} places</Typography>
                        </View>
                      </View>

                      {/* Bottom Row: Driver Info */}
                      <View style={[styles.rideFooter, { borderTopColor: currentColors.border }]}>
                        <View style={styles.driverRow}>
                          <View style={[styles.driverBadge, { backgroundColor: currentColors.background }]}>
                            <Typography variant="bodySemibold">{ride.driver.charAt(0)}</Typography>
                          </View>
                          <View>
                            <Typography variant="bodySemibold">{ride.driver}</Typography>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                              <Feather name="star" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                              <Typography variant="caption" color={currentColors.textSecondary}>{ride.rating}</Typography>
                            </View>
                          </View>
                        </View>
                        <View style={[styles.iconButton, { backgroundColor: currentColors.background }]}>
                           <Feather name="chevron-right" size={20} color={currentColors.text} />
                        </View>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  
  header: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.md, 
    borderBottomWidth: 1,
  },
  avatarBtn: {
    width: 48, 
    height: 48, 
    borderRadius: radii.round,
    justifyContent: 'center', 
    alignItems: 'center',
  },

  searchHero: {
    margin: spacing.md, 
    padding: spacing.xl, 
    borderRadius: radii.xl,
    shadowColor: '#0066FF', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 24, 
    elevation: 8,
  },
  heroLabel: { color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: spacing.sm, fontWeight: '800' },
  heroTitle: { color: '#FFFFFF', marginBottom: spacing.xl },
  searchBar: {
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.md, 
    borderRadius: radii.lg,
  },

  statsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: spacing.md, 
    gap: spacing.sm, 
    marginBottom: spacing.md 
  },
  statCard: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },

  section: { paddingHorizontal: spacing.md, marginTop: spacing.md },
  sectionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.md 
  },

  rideTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  routeRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  cityDot: { width: 8, height: 8, borderRadius: 4, marginRight: spacing.sm },
  priceTag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radii.md },
  
  rideInfo: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  infoChip: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs, 
    borderRadius: radii.round 
  },
  
  rideFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: spacing.md, borderTopWidth: 1 
  },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  driverBadge: { width: 40, height: 40, borderRadius: radii.round, justifyContent: 'center', alignItems: 'center' },
  iconButton: { width: 36, height: 36, borderRadius: radii.round, justifyContent: 'center', alignItems: 'center' },

  skeletonCard: { marginBottom: spacing.md, padding: spacing.lg },
  skeletonLine: { height: 16, borderRadius: radii.sm },
});
