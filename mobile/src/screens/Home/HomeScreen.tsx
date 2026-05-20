import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import GoogleMapView from '../../components/GoogleMapView';
import { useAuth } from '../../context/AuthContext';

const C = {
  red:     '#C1272D',
  redDark: '#9B1B1B',
  green:   '#006233',
  gold:    '#D4890A',
  bg:      '#F5F0EB',
  white:   '#FFFFFF',
  text:    '#1A1A1A',
  textSec: '#6B6B6B',
  border:  '#E8E0D8',
};

const QUICK_ROUTES = [
  { from: 'Casa',    to: 'Rabat',     time: '1h',    price: '45 DH'  },
  { from: 'Rabat',   to: 'Fès',       time: '2h',    price: '80 DH'  },
  { from: 'Casa',    to: 'Marrakech', time: '2h30',  price: '120 DH' },
  { from: 'Tanger',  to: 'Rabat',     time: '3h',    price: '100 DH' },
];

const TRIPS = [
  {
    name: 'Amine B.', init: 'AB', color: '#C1272D',
    rating: 4.9, trips: 134, verified: true, instant: true,
    from: 'Casablanca', fromSub: 'Gare Casa-Voyageurs',
    to: 'Marrakech',    toSub:   'Place Jemaa el-Fna',
    dep: '08:30', arr: '11:00', price: 120, seats: 3,
  },
  {
    name: 'Fatima Z.', init: 'FZ', color: '#1D4ED8',
    rating: 4.8, trips: 89, verified: true, instant: false,
    from: 'Rabat', fromSub: 'Gare Rabat-Ville',
    to: 'Fès',    toSub:   'Médina de Fès',
    dep: '09:15', arr: '11:15', price: 95, seats: 2,
  },
];

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'today',   label: "Aujourd'hui" },
  { key: 'instant', label: 'Instantané' },
  { key: 'cheap',   label: '< 100 DH' },
];

/* Coordonnées des villes marocaines */
const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Casablanca': { latitude: 33.5731,  longitude: -7.5898  },
  'Rabat':      { latitude: 34.0209,  longitude: -6.8416  },
  'Marrakech':  { latitude: 31.6295,  longitude: -7.9811  },
  'Fès':        { latitude: 34.0181,  longitude: -5.0078  },
  'Tanger':     { latitude: 35.7673,  longitude: -5.7998  },
  'Agadir':     { latitude: 30.4202,  longitude: -9.5981  },
  'Meknès':     { latitude: 33.8931,  longitude: -5.5473  },
  'Oujda':      { latitude: 34.6867,  longitude: -1.9114  },
};

async function reverseGeocodeNominatim(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'AtlasWay/1.0' } }
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || '';
  } catch {
    return '';
  }
}

export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const [from, setFrom]         = useState('Casablanca');
  const [to, setTo]             = useState('');
  const [activeNav, setActiveNav]     = useState('home');
  const [activeFilter, setActiveFilter] = useState('all');
  const [locating, setLocating]       = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);


  const swap = () => { const t = from; setFrom(to); setTo(t); };
  const logout = () => setUser(null);

  /* Géolocalisation */
  const handleGeolocate = () => {
    setLocating(true);
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ latitude, longitude });
        const city = await reverseGeocodeNominatim(latitude, longitude);
        if (city) setFrom(city);
        setLocating(false);
      },
      () => {
        setLocating(false);
        Alert.alert('Géolocalisation', 'Impossible de détecter votre position. Vérifiez les permissions.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  /* Afficher la carte de trajet quand from + to sont définis */
  useEffect(() => {
    if (from && to && CITY_COORDS[from] && CITY_COORDS[to]) {
      setShowRouteMap(true);
    } else {
      setShowRouteMap(false);
    }
  }, [from, to]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.red} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── HERO ── */}
        <View style={s.hero}>
          <SafeAreaView>
            {/* TopBar */}
            <View style={s.topBar}>
              <View>
                <Text style={s.logoText}>AtlasWay</Text>
                <Text style={s.tagline}>المغرب · Voyagez malin</Text>
              </View>
              <View style={s.topBtns}>
                <Pressable style={s.topBtn} onPress={logout}>
                  <Text style={{ fontSize: 16 }}>🚪</Text>
                </Pressable>
                <Pressable style={s.topBtn}>
                  <Text style={{ fontSize: 16 }}>🔔</Text>
                </Pressable>
              </View>
            </View>

            <Text style={s.greeting}>Marhaba, {user?.firstName} 👋</Text>
            <Text style={s.heroSub}>Où allez-vous aujourd'hui ?</Text>
          </SafeAreaView>

          {/* ── Search Card ── */}
          <View style={s.searchCard}>
            {/* Départ + bouton GPS */}
            <Pressable style={s.searchRow}>
              <View style={s.dotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>DÉPART</Text>
                <Text style={from ? s.fieldVal : s.fieldPh}>
                  {from || "D'où partez-vous ?"}
                </Text>
              </View>
              <Pressable
                onPress={handleGeolocate}
                disabled={locating}
                style={s.gpsBtn}
              >
                {locating
                  ? <ActivityIndicator size="small" color={C.gold} />
                  : <Text style={{ fontSize: 16 }}>📍</Text>
                }
              </Pressable>
            </Pressable>

            {/* Swap */}
            <View style={s.swapRow}>
              <View style={s.swapLine} />
              <Pressable style={s.swapBtn} onPress={swap}>
                <Text style={{ color: C.red, fontWeight: '700', fontSize: 18 }}>⇅</Text>
              </Pressable>
              <View style={s.swapLine} />
            </View>

            {/* Arrivée */}
            <Pressable style={s.searchRow}>
              <View style={s.dotRed} />
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>ARRIVÉE</Text>
                <Text style={to ? s.fieldVal : s.fieldPh}>
                  {to || 'Où allez-vous ?'}
                </Text>
              </View>
            </Pressable>

            {/* Date + Pax */}
            <View style={s.searchMeta}>
              <Pressable style={s.metaBtn}>
                <Text style={s.metaIcon}>📅</Text>
                <Text style={s.metaText}>Aujourd'hui</Text>
              </Pressable>
              <View style={s.metaDiv} />
              <Pressable style={s.metaBtn}>
                <Text style={s.metaIcon}>👤</Text>
                <Text style={s.metaText}>1 passager</Text>
              </Pressable>
            </View>

            <Pressable style={s.searchBtn}>
              <Text style={s.searchBtnText}>🔍  Rechercher un trajet</Text>
            </Pressable>
          </View>

          {/* ── Route Map Google Maps (WebView) ── */}
          {showRouteMap && from && to && (
            <View style={s.routeMapCard}>
              <View style={s.routeMapHeader}>
                <Text style={s.routeMapTitle}>{from} → {to}</Text>
              </View>
              <GoogleMapView
                from={from}
                to={to}
                height={190}
                userLat={userLocation?.latitude}
                userLng={userLocation?.longitude}
              />
            </View>
          )}
        </View>

        {/* ── BODY ── */}
        <View style={s.body}>

          {/* Trajets rapides */}
          <View style={s.section}>
            <View style={s.sectionHdr}>
              <Text style={s.sectionTitle}>Trajets rapides</Text>
              <Text style={s.seeAll}>Voir tout →</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {QUICK_ROUTES.map((r, i) => (
                <Pressable key={i} style={s.quickCard}>
                  <Text style={{ fontSize: 22, marginBottom: 8 }}>🗺️</Text>
                  <Text style={s.quickCity}>{r.from}</Text>
                  <Text style={s.quickArrow}>↓</Text>
                  <Text style={s.quickCity}>{r.to}</Text>
                  <Text style={s.quickTime}>{r.time}</Text>
                  <Text style={s.quickPrice}>{r.price}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Promo banner */}
          <View style={s.promo}>
            <Text style={{ fontSize: 30 }}>🎁</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.promoTitle}>Parrainez & gagnez</Text>
              <Text style={s.promoSub}>Invitez un ami → 50 DH de crédit</Text>
            </View>
            <Pressable style={s.promoCta}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Voir →</Text>
            </Pressable>
          </View>

          {/* Trajets disponibles */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Trajets disponibles</Text>

            {/* Filtres */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10, marginBottom: 2 }}>
              {FILTERS.map(f => (
                <Pressable
                  key={f.key}
                  style={[s.chip, activeFilter === f.key && s.chipActive]}
                  onPress={() => setActiveFilter(f.key)}
                >
                  <Text style={[s.chipTxt, activeFilter === f.key && s.chipTxtActive]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Cards de trajets */}
            {TRIPS.map((t, i) => (
              <View key={i} style={s.tripCard}>
                {/* Badges */}
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                  {t.instant && (
                    <View style={s.badgeInstant}>
                      <Text style={s.badgeInstantTxt}>Instantané</Text>
                    </View>
                  )}
                  <View style={s.badgeToday}>
                    <Text style={s.badgeTodayTxt}>Aujourd'hui</Text>
                  </View>
                </View>

                {/* Timeline */}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'stretch' }}>
                  <View style={{ alignItems: 'center', width: 44 }}>
                    <Text style={s.tlHour}>{t.dep}</Text>
                    <View style={s.tlDotG} />
                    <View style={s.tlLine} />
                    <View style={s.tlDotR} />
                    <Text style={s.tlHour}>{t.arr}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View>
                      <Text style={s.cityName}>{t.from}</Text>
                      <Text style={s.citySub}>{t.fromSub}</Text>
                    </View>
                    <View>
                      <Text style={s.cityName}>{t.to}</Text>
                      <Text style={s.citySub}>{t.toSub}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                    <Text style={s.priceVal}>{t.price}</Text>
                    <Text style={s.priceCur}>DH</Text>
                    <Text style={s.priceLbl}>/ pers.</Text>
                  </View>
                </View>

                <View style={s.tdiv} />

                {/* Conducteur */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[s.avatar, { backgroundColor: t.color }]}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t.init}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={s.driverName}>
                      {t.name}{t.verified ? ' ✓' : ''}
                    </Text>
                    <Text style={s.driverMeta}>⭐ {t.rating} · {t.trips} trajets</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={s.seatsN}>{t.seats}</Text>
                    <Text style={s.seatsLbl}>place{t.seats > 1 ? 's' : ''}</Text>
                  </View>
                </View>

                <Pressable style={s.tripCta}>
                  <Text style={s.tripCtaTxt}>Voir le trajet →</Text>
                </Pressable>
              </View>
            ))}
          </View>

          {/* Vous conduisez ? */}
          <Pressable style={s.publish}>
            <Text style={{ fontSize: 30 }}>🚗</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={s.publishTitle}>Vous conduisez ?</Text>
              <Text style={s.publishSub}>Publiez votre trajet et partagez vos frais</Text>
            </View>
            <View style={s.publishArrow}>
              <Text style={{ color: '#fff', fontSize: 18 }}>→</Text>
            </View>
          </Pressable>

          {/* Stats */}
          <View style={s.stats}>
            {[
              ['50K+',  'Membres'],
              ['200K+', 'Trajets'],
              ['4.8',   'Note moy.'],
              ['35',    'Villes'],
            ].map(([val, lbl], i) => (
              <View key={i} style={[s.stat, i > 0 && s.statBorder]}>
                <Text style={s.statVal}>{val}</Text>
                <Text style={s.statLbl}>{lbl}</Text>
              </View>
            ))}
          </View>

          {/* Comment ça marche */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, { marginBottom: 12 }]}>Comment ça marche ?</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { n: '1', icon: '🔍', title: 'Cherchez',  desc: 'Saisissez votre trajet et la date' },
                { n: '2', icon: '✅', title: 'Réservez',  desc: 'Choisissez un conducteur en un clic' },
                { n: '3', icon: '🚗', title: 'Voyagez',   desc: 'Partez ensemble en toute sécurité' },
              ].map(step => (
                <View key={step.n} style={s.howStep}>
                  <View style={s.howNum}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>{step.n}</Text>
                  </View>
                  <Text style={{ fontSize: 20, marginBottom: 6 }}>{step.icon}</Text>
                  <Text style={s.howTitle}>{step.title}</Text>
                  <Text style={s.howDesc}>{step.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* ── BOTTOM NAV ── */}
      <View style={s.bottomNav}>
        {[
          { key: 'home',    icon: '🏠', label: 'Accueil'   },
          { key: 'search',  icon: '🔍', label: 'Recherche' },
          { key: 'trips',   icon: '📋', label: 'Trajets'   },
          { key: 'profile', icon: '👤', label: 'Profil'    },
        ].map(({ key, icon, label }) => (
          <Pressable
            key={key}
            style={s.navItem}
            onPress={() => setActiveNav(key)}
          >
            <Text style={{ fontSize: 20 }}>{icon}</Text>
            <Text style={[s.navLabel, activeNav === key && s.navLabelActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },

  /* Hero */
  hero: { backgroundColor: C.red, paddingHorizontal: 18, paddingBottom: 0 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, paddingTop: 16 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 0.5 },
  tagline:  { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 2 },
  topBtns:  { flexDirection: 'row', gap: 8 },
  topBtn:   { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 8 },
  greeting: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 2 },
  heroSub:  { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 16 },

  /* GPS button */
  gpsBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(212,137,10,0.12)' },

  /* Route Map Card */
  routeMapCard:   { marginTop: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: '#fff' },
  routeMapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.95)' },
  routeMapTitle:  { fontSize: 13, fontWeight: '700', color: C.red },
  routeMap:       { height: 180 },

  /* Search card */
  searchCard:   { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 0 },
  searchRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 6 },
  dotGreen:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16a34a', borderWidth: 2, borderColor: '#bbf7d0' },
  dotRed:       { width: 10, height: 10, borderRadius: 5, backgroundColor: C.red,    borderWidth: 2, borderColor: '#fecaca' },
  fieldLabel:   { color: '#bbb', fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  fieldVal:     { color: '#1a1a1a', fontSize: 15, fontWeight: '600', marginTop: 1 },
  fieldPh:      { color: '#ccc',    fontSize: 15, marginTop: 1 },
  swapRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  swapLine:     { flex: 1, height: 1, backgroundColor: '#f0f0f0' },
  swapBtn:      { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e8e8e8', alignItems: 'center', justifyContent: 'center' },
  searchMeta:   { flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 10, marginTop: 10, overflow: 'hidden' },
  metaBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
  metaIcon:     { fontSize: 14 },
  metaText:     { fontSize: 12, color: '#444', fontWeight: '500' },
  metaDiv:      { width: 1, backgroundColor: '#ebebeb' },
  searchBtn:    { backgroundColor: C.red, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
  searchBtnText:{ color: '#fff', fontWeight: '600', fontSize: 15 },

  /* Body */
  body:         { backgroundColor: C.bg, paddingHorizontal: 14, paddingBottom: 14 },
  section:      { marginTop: 22 },
  sectionHdr:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: C.text },
  seeAll:       { fontSize: 13, color: C.red, fontWeight: '500' },

  /* Quick cards */
  quickCard:  { backgroundColor: '#fff', borderRadius: 16, padding: 14, minWidth: 115, alignItems: 'center', borderWidth: 1.5, borderColor: '#f0e8e8', marginRight: 10 },
  quickCity:  { fontSize: 13, fontWeight: '600', color: C.text },
  quickArrow: { fontSize: 14, color: C.red, fontWeight: '700', marginVertical: 2 },
  quickTime:  { fontSize: 11, color: C.textSec, marginTop: 6 },
  quickPrice: { fontSize: 14, fontWeight: '600', color: C.red, marginTop: 4 },

  /* Promo */
  promo:      { backgroundColor: C.red, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  promoTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 3 },
  promoSub:   { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  promoCta:   { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7 },

  /* Filters */
  chip:        { borderWidth: 1.5, borderColor: C.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', marginRight: 8 },
  chipActive:  { backgroundColor: C.red, borderColor: C.red },
  chipTxt:     { fontSize: 12, color: C.textSec, fontWeight: '500' },
  chipTxtActive:{ color: '#fff' },

  /* Trip cards */
  tripCard:        { backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 0.5, borderColor: '#e8e8e8', marginTop: 12 },
  badgeInstant:    { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde68a', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  badgeInstantTxt: { fontSize: 11, color: '#92400e', fontWeight: '500' },
  badgeToday:      { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  badgeTodayTxt:   { fontSize: 11, color: '#166534', fontWeight: '500' },
  tlHour:   { fontSize: 12, fontWeight: '600', color: C.text },
  tlDotG:   { width: 9, height: 9, borderRadius: 5, backgroundColor: '#16a34a', marginVertical: 4 },
  tlDotR:   { width: 9, height: 9, borderRadius: 5, backgroundColor: C.red,    marginVertical: 4 },
  tlLine:   { flex: 1, width: 2, backgroundColor: '#f0f0f0', borderRadius: 1, minHeight: 20 },
  cityName: { fontSize: 15, fontWeight: '600', color: C.text },
  citySub:  { fontSize: 11, color: C.textSec, marginTop: 1 },
  priceVal: { fontSize: 26, fontWeight: '700', color: C.red, lineHeight: 28 },
  priceCur: { fontSize: 13, color: C.red, fontWeight: '600' },
  priceLbl: { fontSize: 10, color: C.textSec, marginTop: 2 },
  tdiv:     { height: 1, backgroundColor: '#f5f5f5', marginVertical: 12 },
  avatar:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  driverName:{ fontSize: 14, fontWeight: '600', color: C.text },
  driverMeta:{ fontSize: 12, color: C.textSec, marginTop: 2 },
  seatsN:   { fontSize: 16, fontWeight: '600', color: C.text },
  seatsLbl: { fontSize: 10, color: C.textSec },
  tripCta:  { backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: 'rgba(193,39,45,0.25)', borderRadius: 10, padding: 11, alignItems: 'center', marginTop: 12 },
  tripCtaTxt:{ color: C.red, fontWeight: '600', fontSize: 13 },

  /* Publish */
  publish:      { backgroundColor: C.gold, borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 22 },
  publishTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  publishSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  publishArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },

  /* Stats */
  stats:      { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, borderWidth: 0.5, borderColor: '#e8e8e8', overflow: 'hidden', marginTop: 22 },
  stat:       { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  statBorder: { borderLeftWidth: 0.5, borderLeftColor: '#e8e8e8' },
  statVal:    { fontSize: 16, fontWeight: '700', color: C.red },
  statLbl:    { fontSize: 10, color: C.textSec, marginTop: 2 },

  /* How it works */
  howStep:  { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 0.5, borderColor: '#e8e8e8' },
  howNum:   { width: 24, height: 24, borderRadius: 12, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  howTitle: { fontSize: 12, fontWeight: '600', color: C.text, marginBottom: 4, textAlign: 'center' },
  howDesc:  { fontSize: 10, color: C.textSec, lineHeight: 14, textAlign: 'center' },

  /* Bottom nav */
  bottomNav:      { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#e8e8e8', paddingBottom: 20, paddingTop: 10 },
  navItem:        { flex: 1, alignItems: 'center', gap: 3 },
  navLabel:       { fontSize: 10, color: C.textSec },
  navLabelActive: { color: C.red, fontWeight: '600' },
});
