import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, TextInput,
  StyleSheet, SafeAreaView, StatusBar, ActivityIndicator,
  Alert, TouchableOpacity,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation } from '@react-navigation/native';
import GoogleMapView from '../../components/GoogleMapView';
import { useAuth } from '../../context/AuthContext';

/* ── Palette ── */
const C = {
  bg:        '#0B0704',
  card:      '#1C0C07',
  border:    'rgba(212,137,10,0.18)',
  borderCard:'rgba(212,137,10,0.28)',
  red:       '#C1272D',
  gold:      '#D4890A',
  green:     '#005A2E',
  text:      '#F5EDD8',
  textSec:   'rgba(245,237,216,0.65)',
  textMuted: 'rgba(245,237,216,0.38)',
  input:     '#150906',
};

const QUICK_ROUTES = [
  { from: 'Casa',    to: 'Rabat',     time: '1h',   price: '45 DH',  emoji: '🏛️' },
  { from: 'Rabat',   to: 'Fès',       time: '2h',   price: '80 DH',  emoji: '⛩️' },
  { from: 'Casa',    to: 'Marrakech', time: '2h30', price: '120 DH', emoji: '🕌' },
  { from: 'Tanger',  to: 'Rabat',     time: '3h',   price: '100 DH', emoji: '🌊' },
  { from: 'Agadir',  to: 'Marrakech', time: '1h30', price: '70 DH',  emoji: '🌴' },
];

const TRIPS = [
  {
    name: 'Amine B.', init: 'AB', color: '#C1272D',
    rating: 4.9, trips: 134, verified: true, instant: true,
    from: 'Casablanca', fromSub: 'Gare Casa-Voyageurs',
    to: 'Marrakech', toSub: 'Place Jemaa el-Fna',
    dep: '08:30', arr: '11:00', price: 120, seats: 3,
  },
  {
    name: 'Fatima Z.', init: 'FZ', color: '#D4890A',
    rating: 4.8, trips: 89, verified: true, instant: false,
    from: 'Rabat', fromSub: 'Gare Rabat-Ville',
    to: 'Fès', toSub: 'Médina de Fès',
    dep: '09:15', arr: '11:15', price: 95, seats: 2,
  },
  {
    name: 'Karim O.', init: 'KO', color: '#005A2E',
    rating: 4.7, trips: 212, verified: true, instant: true,
    from: 'Tanger', fromSub: 'Place du Grand Socco',
    to: 'Casablanca', toSub: 'Twin Center',
    dep: '07:00', arr: '10:30', price: 110, seats: 1,
  },
];

const FILTERS = [
  { key: 'all',     label: 'Tous' },
  { key: 'today',   label: "Aujourd'hui" },
  { key: 'instant', label: '⚡ Instantané' },
  { key: 'cheap',   label: '< 100 DH' },
];

const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir',
  'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida',
  'Beni Mellal', 'Nador', 'Mohammedia',
];

const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  'Casablanca': { latitude: 33.5731, longitude: -7.5898 },
  'Rabat':      { latitude: 34.0209, longitude: -6.8416 },
  'Marrakech':  { latitude: 31.6295, longitude: -7.9811 },
  'Fès':        { latitude: 34.0181, longitude: -5.0078 },
  'Tanger':     { latitude: 35.7673, longitude: -5.7998 },
  'Agadir':     { latitude: 30.4202, longitude: -9.5981 },
};

async function reverseGeocodeNominatim(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`,
      { headers: { 'User-Agent': 'AtlasWay/1.0' } }
    );
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || '';
  } catch { return ''; }
}

function FlagBar() {
  return (
    <View style={{ height: 3, flexDirection: 'row' }}>
      {['#B8232A', '#D4890A', '#005A2E', '#D4890A', '#B8232A'].map((c, i) => (
        <View key={i} style={{ flex: i === 1 || i === 3 ? 0.4 : 1, backgroundColor: c }} />
      ))}
    </View>
  );
}

/* ─────────────────────── TAB: HOME ─────────────────────── */
function HomeTab({ user }: { user: any }) {
  const [from, setFrom]             = useState('Casablanca');
  const [to, setTo]                 = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [locating, setLocating]     = useState(false);
  const [showRouteMap, setShowRouteMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const swap = () => { const t = from; setFrom(to); setTo(t); };

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
        Alert.alert('Géolocalisation', 'Impossible de détecter votre position.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (from && to && CITY_COORDS[from] && CITY_COORDS[to]) setShowRouteMap(true);
    else setShowRouteMap(false);
  }, [from, to]);

  const filteredTrips = TRIPS.filter(t => {
    if (activeFilter === 'instant') return t.instant;
    if (activeFilter === 'cheap')   return t.price < 100;
    return true;
  });

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* HERO */}
      <View style={s.hero}>
        <FlagBar />
        <SafeAreaView style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 0 }}>
          <View style={s.topBar}>
            <View>
              <Text style={s.logoText}>Atlas<Text style={{ color: C.gold }}>Way</Text></Text>
              <Text style={s.tagline}>المغرب · Voyagez malin</Text>
            </View>
            <View style={s.topBtns}>
              <Pressable style={s.topBtn} accessibilityLabel="Notifications">
                <Text style={{ fontSize: 16 }}>🔔</Text>
              </Pressable>
            </View>
          </View>

          <Text style={s.greeting}>Marhaba, {user?.firstName} 👋</Text>
          <Text style={s.heroSub}>Où allez-vous aujourd'hui ?</Text>

          {/* Search Card */}
          <View style={s.searchCard}>
            <Pressable style={s.searchRow}>
              <View style={s.dotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>DÉPART</Text>
                <Text style={from ? s.fieldVal : s.fieldPh}>{from || "D'où partez-vous ?"}</Text>
              </View>
              <Pressable onPress={handleGeolocate} disabled={locating} style={s.gpsBtn} accessibilityLabel="Détecter ma position">
                {locating ? <ActivityIndicator size="small" color={C.gold} /> : <Text style={{ fontSize: 16 }}>📍</Text>}
              </Pressable>
            </Pressable>

            <View style={s.swapRow}>
              <View style={s.swapLine} />
              <Pressable style={s.swapBtn} onPress={swap} accessibilityLabel="Inverser">
                <Text style={{ color: C.red, fontWeight: '700', fontSize: 18 }}>⇅</Text>
              </Pressable>
              <View style={s.swapLine} />
            </View>

            <Pressable style={s.searchRow}>
              <View style={s.dotRed} />
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>ARRIVÉE</Text>
                <Text style={to ? s.fieldVal : s.fieldPh}>{to || 'Où allez-vous ?'}</Text>
              </View>
            </Pressable>

            <View style={s.searchMeta}>
              <Pressable style={s.metaBtn}>
                <Text style={s.metaIcon}>📅</Text>
                <Text style={s.metaTxt}>Aujourd'hui</Text>
              </Pressable>
              <View style={s.metaDiv} />
              <Pressable style={s.metaBtn}>
                <Text style={s.metaIcon}>👤</Text>
                <Text style={s.metaTxt}>1 passager</Text>
              </Pressable>
            </View>

            <Pressable style={s.searchBtn}>
              <Text style={s.searchBtnTxt}>🔍  Rechercher un trajet</Text>
            </Pressable>
          </View>

          {showRouteMap && from && to && (
            <View style={s.routeMapCard}>
              <Text style={s.routeMapTitle}>{from} → {to}</Text>
              <GoogleMapView from={from} to={to} height={180}
                userLat={userLocation?.latitude} userLng={userLocation?.longitude} />
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* BODY */}
      <View style={s.body}>
        {/* Quick routes */}
        <View style={s.section}>
          <View style={s.sectionHdr}>
            <View>
              <Text style={s.sectionBadge}>Populaires</Text>
              <Text style={s.sectionTitle}>Trajets fréquents</Text>
            </View>
            <Text style={s.seeAll}>Voir tout →</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {QUICK_ROUTES.map((r, i) => (
              <Pressable key={i} style={s.quickCard}>
                <Text style={{ fontSize: 22, marginBottom: 8 }}>{r.emoji}</Text>
                <Text style={s.quickFrom}>{r.from}</Text>
                <Text style={{ color: C.red, fontSize: 12, fontWeight: '700', marginVertical: 2 }}>↓</Text>
                <Text style={s.quickTo}>{r.to}</Text>
                <Text style={s.quickTime}>{r.time}</Text>
                <Text style={s.quickPrice}>{r.price}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Promo */}
        <View style={s.promo}>
          <Text style={{ fontSize: 28 }}>🎁</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.promoTitle}>Parrainez & gagnez</Text>
            <Text style={s.promoSub}>Invitez un ami → 50 DH de crédit</Text>
          </View>
          <Pressable style={s.promoCta}>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>Voir →</Text>
          </Pressable>
        </View>

        {/* Trips */}
        <View style={s.section}>
          <View style={s.sectionHdr}>
            <View>
              <Text style={s.sectionBadge}>En temps réel</Text>
              <Text style={s.sectionTitle}>Prochains trajets</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
            {FILTERS.map(f => (
              <Pressable
                key={f.key}
                style={[s.chip, activeFilter === f.key && s.chipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[s.chipTxt, activeFilter === f.key && s.chipTxtActive]}>{f.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {filteredTrips.map((t, i) => <TripCard key={i} t={t} />)}
        </View>

        {/* Publish */}
        <Pressable style={s.publish}>
          <Text style={{ fontSize: 28 }}>🚗</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={s.publishTitle}>Vous conduisez ?</Text>
            <Text style={s.publishSub}>Publiez votre trajet et partagez vos frais</Text>
          </View>
          <View style={s.publishArrow}>
            <Text style={{ color: C.gold, fontSize: 18 }}>→</Text>
          </View>
        </Pressable>

        {/* Stats */}
        <View style={s.stats}>
          {[['50K+', 'Membres'], ['200K+', 'Trajets'], ['4.8', 'Note moy.'], ['35', 'Villes']].map(([val, lbl], i) => (
            <View key={i} style={[s.stat, i > 0 && s.statBorder]}>
              <Text style={s.statVal}>{val}</Text>
              <Text style={s.statLbl}>{lbl}</Text>
            </View>
          ))}
        </View>

        {/* How it works */}
        <View style={s.section}>
          <View style={{ marginBottom: 12 }}>
            <Text style={s.sectionBadge}>Simple & rapide</Text>
            <Text style={s.sectionTitle}>Comment ça marche ?</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { n: '1', icon: '🔍', title: 'Cherchez',  desc: 'Saisissez votre trajet et la date' },
              { n: '2', icon: '✅', title: 'Réservez',  desc: 'Choisissez un conducteur en un clic' },
              { n: '3', icon: '🚗', title: 'Voyagez',   desc: 'Partez ensemble en toute sécurité' },
            ].map(step => (
              <View key={step.n} style={s.howStep}>
                <View style={s.howNum}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>{step.n}</Text>
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
  );
}

/* ─────────────────────── TAB: SEARCH ─────────────────────── */
function SearchTab() {
  const [fromCity, setFromCity] = useState('');
  const [toCity,   setToCity]   = useState('');
  const [fromQ,    setFromQ]    = useState('');
  const [toQ,      setToQ]      = useState('');
  const [focus,    setFocus]    = useState<'from' | 'to' | null>(null);
  const [date,     setDate]     = useState<'today' | 'tomorrow' | 'later'>('today');
  const [pax,      setPax]      = useState(1);

  const filtered = (q: string) =>
    MOROCCAN_CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase()));

  const selectCity = (city: string) => {
    if (focus === 'from') { setFromCity(city); setFromQ(''); }
    else                  { setToCity(city);   setToQ(''); }
    setFocus(null);
  };

  const canSearch = fromCity && toCity;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={s.hero}>
        <FlagBar />
        <SafeAreaView style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}>
          <Text style={s.logoText}>Atlas<Text style={{ color: C.gold }}>Way</Text></Text>
          <Text style={s.tagline}>المغرب · Voyagez malin</Text>
          <Text style={[s.greeting, { marginTop: 12 }]}>Trouver un trajet</Text>
          <Text style={s.heroSub}>Sélectionnez votre départ et arrivée</Text>
        </SafeAreaView>
      </View>

      <View style={[s.body, { paddingTop: 20 }]}>
        {/* Search form card */}
        <View style={s.searchCard}>
          {/* From */}
          <Text style={[s.fieldLabel, { marginBottom: 6 }]}>DÉPART</Text>
          <Pressable
            style={[s.cityInput, focus === 'from' && s.cityInputFocus]}
            onPress={() => setFocus(focus === 'from' ? null : 'from')}
          >
            <Text style={{ fontSize: 14 }}>🟢</Text>
            <Text style={[{ flex: 1, fontSize: 15, marginLeft: 10 }, fromCity ? s.fieldVal : s.fieldPh]}>
              {fromCity || "D'où partez-vous ?"}
            </Text>
            {fromCity && (
              <Pressable onPress={() => setFromCity('')} style={{ padding: 8 }}>
                <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
              </Pressable>
            )}
          </Pressable>

          {focus === 'from' && (
            <View style={s.cityDropdown}>
              <TextInput
                value={fromQ}
                onChangeText={setFromQ}
                placeholder="Rechercher une ville..."
                placeholderTextColor={C.textMuted}
                style={s.citySearch}
                autoFocus
              />
              {filtered(fromQ).map(city => (
                <Pressable key={city} style={s.cityOption} onPress={() => selectCity(city)}>
                  <Text style={{ fontSize: 13 }}>📍</Text>
                  <Text style={s.cityOptionTxt}>{city}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: 12 }} />

          {/* To */}
          <Text style={[s.fieldLabel, { marginBottom: 6 }]}>ARRIVÉE</Text>
          <Pressable
            style={[s.cityInput, focus === 'to' && s.cityInputFocus]}
            onPress={() => setFocus(focus === 'to' ? null : 'to')}
          >
            <Text style={{ fontSize: 14 }}>🔴</Text>
            <Text style={[{ flex: 1, fontSize: 15, marginLeft: 10 }, toCity ? s.fieldVal : s.fieldPh]}>
              {toCity || 'Où allez-vous ?'}
            </Text>
            {toCity && (
              <Pressable onPress={() => setToCity('')} style={{ padding: 8 }}>
                <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
              </Pressable>
            )}
          </Pressable>

          {focus === 'to' && (
            <View style={s.cityDropdown}>
              <TextInput
                value={toQ}
                onChangeText={setToQ}
                placeholder="Rechercher une ville..."
                placeholderTextColor={C.textMuted}
                style={s.citySearch}
                autoFocus
              />
              {filtered(toQ).map(city => (
                <Pressable key={city} style={s.cityOption} onPress={() => selectCity(city)}>
                  <Text style={{ fontSize: 13 }}>📍</Text>
                  <Text style={s.cityOptionTxt}>{city}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={{ height: 16 }} />

          {/* Date */}
          <Text style={[s.fieldLabel, { marginBottom: 8 }]}>DATE</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {(['today', 'tomorrow', 'later'] as const).map(d => (
              <Pressable
                key={d}
                style={[s.dateChip, date === d && s.dateChipActive]}
                onPress={() => setDate(d)}
              >
                <Text style={[s.dateChipTxt, date === d && s.dateChipTxtActive]}>
                  {d === 'today' ? "Aujourd'hui" : d === 'tomorrow' ? 'Demain' : 'Choisir'}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Passengers */}
          <Text style={[s.fieldLabel, { marginBottom: 8 }]}>PASSAGERS</Text>
          <View style={s.paxRow}>
            <TouchableOpacity
              style={s.paxBtn}
              onPress={() => setPax(Math.max(1, pax - 1))}
              accessibilityLabel="Réduire"
            >
              <Text style={{ color: C.text, fontSize: 20, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>
            <Text style={s.paxVal}>{pax} passager{pax > 1 ? 's' : ''}</Text>
            <TouchableOpacity
              style={s.paxBtn}
              onPress={() => setPax(Math.min(8, pax + 1))}
              accessibilityLabel="Augmenter"
            >
              <Text style={{ color: C.text, fontSize: 20, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </View>

          <Pressable
            style={[s.searchBtn, !canSearch && { opacity: 0.45 }]}
            disabled={!canSearch}
          >
            <Text style={s.searchBtnTxt}>🔍  Rechercher un trajet</Text>
          </Pressable>
        </View>

        {/* Popular destinations */}
        <View style={s.section}>
          <Text style={s.sectionBadge}>Populaires</Text>
          <Text style={s.sectionTitle}>Destinations fréquentes</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {MOROCCAN_CITIES.slice(0, 9).map(city => (
              <Pressable
                key={city}
                style={s.destChip}
                onPress={() => { setToCity(city); setFocus(null); }}
              >
                <Text style={s.destChipTxt}>📍 {city}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
}

/* ─────────────────────── TAB: TRIPS ─────────────────────── */
function TripsTab({ user }: { user: any }) {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={s.hero}>
        <FlagBar />
        <SafeAreaView style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 20 }}>
          <Text style={s.logoText}>Atlas<Text style={{ color: C.gold }}>Way</Text></Text>
          <Text style={[s.greeting, { marginTop: 12 }]}>Mes trajets</Text>
          <Text style={s.heroSub}>Vos réservations et trajets passés</Text>
        </SafeAreaView>
      </View>

      <View style={[s.body, { paddingTop: 20 }]}>
        {/* Tabs */}
        <View style={s.innerTabs}>
          <Pressable
            style={[s.innerTab, tab === 'upcoming' && s.innerTabActive]}
            onPress={() => setTab('upcoming')}
          >
            <Text style={[s.innerTabTxt, tab === 'upcoming' && s.innerTabTxtActive]}>
              À venir
            </Text>
          </Pressable>
          <Pressable
            style={[s.innerTab, tab === 'past' && s.innerTabActive]}
            onPress={() => setTab('past')}
          >
            <Text style={[s.innerTabTxt, tab === 'past' && s.innerTabTxtActive]}>
              Historique
            </Text>
          </Pressable>
        </View>

        {tab === 'upcoming' ? (
          <View style={s.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🗺️</Text>
            <Text style={s.emptyTitle}>Aucun trajet à venir</Text>
            <Text style={s.emptySub}>
              Vous n'avez pas encore réservé de trajet.{'\n'}
              Commencez par rechercher une destination !
            </Text>
            <Pressable style={[s.searchBtn, { marginTop: 20, paddingHorizontal: 24 }]}>
              <Text style={s.searchBtnTxt}>🔍  Trouver un trajet</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            {/* Past trip card sample */}
            <View style={[s.tripCard, { opacity: 0.75 }]}>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <View style={[s.badgeToday, { backgroundColor: 'rgba(245,237,216,0.06)' }]}>
                  <Text style={[s.badgeTodayTxt, { color: C.textMuted }]}>✓ Terminé · 12 mai 2026</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ alignItems: 'center', width: 44 }}>
                  <Text style={s.tlHour}>07:30</Text>
                  <View style={s.tlDotG} />
                  <View style={s.tlLine} />
                  <View style={s.tlDotR} />
                  <Text style={s.tlHour}>10:00</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={s.cityName}>Casablanca</Text>
                    <Text style={s.citySub}>Gare Casa-Voyageurs</Text>
                  </View>
                  <View style={{ marginTop: 16 }}>
                    <Text style={s.cityName}>Marrakech</Text>
                    <Text style={s.citySub}>Place Jemaa el-Fna</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Text style={s.priceVal}>110</Text>
                  <Text style={s.priceCur}>DH</Text>
                </View>
              </View>
              <View style={s.tdiv} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[s.avatar, { backgroundColor: '#D4890A' }]}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>YB</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.driverName}>Youssef B. ✦</Text>
                  <Text style={s.driverMeta}>⭐ 4.9 · 156 trajets</Text>
                </View>
                <View style={[s.promoCta, { borderColor: 'rgba(212,137,10,0.3)' }]}>
                  <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>Évaluer →</Text>
                </View>
              </View>
            </View>

            <View style={s.emptyBox}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
              <Text style={s.emptyTitle}>C'est tout pour l'instant</Text>
              <Text style={s.emptySub}>Votre prochain trajet apparaîtra ici</Text>
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
}

/* ─────────────────────── TAB: PROFILE ─────────────────────── */
function ProfileTab({ user, onLogout }: { user: any; onLogout: () => void }) {
  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase();

  const MENU = [
    { icon: '✏️',  label: 'Modifier le profil',   sublabel: 'Nom, photo, téléphone' },
    { icon: '🔔',  label: 'Notifications',          sublabel: 'Gérer les alertes' },
    { icon: '🔒',  label: 'Sécurité',               sublabel: 'Mot de passe, 2FA' },
    { icon: '🌍',  label: 'Langue',                 sublabel: 'Français · العربية · Darija' },
    { icon: '💳',  label: 'Paiement',               sublabel: 'Cartes & portefeuille' },
    { icon: '❓',  label: 'Aide & Support',          sublabel: 'FAQ, contact' },
    { icon: '📄',  label: "Conditions d'utilisation", sublabel: 'Lire nos CGU' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={[s.hero, { paddingBottom: 0 }]}>
        <FlagBar />
        <SafeAreaView style={{ paddingHorizontal: 18, paddingTop: 14, paddingBottom: 28, alignItems: 'center' }}>
          <Text style={[s.logoText, { marginBottom: 20 }]}>Atlas<Text style={{ color: C.gold }}>Way</Text></Text>

          {/* Avatar */}
          <View style={s.profileAvatar}>
            <Text style={s.profileAvatarTxt}>{initials}</Text>
          </View>
          <Text style={s.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={s.profileEmail}>{user?.email}</Text>

          {/* Quick stats */}
          <View style={s.profileStats}>
            {[['0', 'Trajets'], ['0', 'Avis'], ['—', 'Note']].map(([val, lbl], i) => (
              <View key={i} style={[s.profileStat, i > 0 && { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={s.profileStatVal}>{val}</Text>
                <Text style={s.profileStatLbl}>{lbl}</Text>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </View>

      <View style={[s.body, { paddingTop: 20 }]}>
        {/* Verified badge */}
        <View style={s.verifiedBox}>
          <Text style={{ fontSize: 16 }}>✦</Text>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={{ color: C.gold, fontWeight: '700', fontSize: 13 }}>Compte non vérifié</Text>
            <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 2 }}>
              Vérifiez votre identité pour accéder à plus de fonctionnalités
            </Text>
          </View>
          <Pressable style={s.verifyBtn}>
            <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700' }}>Vérifier →</Text>
          </Pressable>
        </View>

        {/* Menu */}
        <View style={s.menuCard}>
          {MENU.map((item, i) => (
            <Pressable
              key={i}
              style={[s.menuItem, i > 0 && s.menuItemBorder]}
              accessibilityLabel={item.label}
            >
              <Text style={{ fontSize: 20, width: 36 }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.menuLabel}>{item.label}</Text>
                <Text style={s.menuSub}>{item.sublabel}</Text>
              </View>
              <Text style={{ color: C.textMuted, fontSize: 16 }}>›</Text>
            </Pressable>
          ))}
        </View>

        {/* App version */}
        <Text style={s.appVersion}>AtlasWay Mobile v1.0.0</Text>

        {/* Logout */}
        <Pressable style={s.logoutBtn} onPress={onLogout} accessibilityLabel="Se déconnecter">
          <Text style={{ fontSize: 18 }}>🚪</Text>
          <Text style={s.logoutTxt}>Se déconnecter</Text>
        </Pressable>

        <View style={{ height: 24 }} />
      </View>
    </ScrollView>
  );
}

/* ─────────────────────── SHARED: TripCard ─────────────────────── */
function TripCard({ t }: { t: typeof TRIPS[0] }) {
  return (
    <View style={s.tripCard}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        {t.instant && (
          <View style={s.badgeInstant}>
            <Text style={s.badgeInstantTxt}>⚡ Instantané</Text>
          </View>
        )}
        <View style={s.badgeToday}>
          <Text style={s.badgeTodayTxt}>Aujourd'hui</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
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
          <View style={{ marginTop: 16 }}>
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

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[s.avatar, { backgroundColor: t.color }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t.init}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={s.driverName}>{t.name}{t.verified ? ' ✦' : ''}</Text>
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
  );
}

/* ─────────────────────── ROOT ─────────────────────── */
export default function HomeScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation();
  const [activeNav, setActiveNav] = useState('home');

  const logout = () => setUser(null);

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.red} />

      <View style={{ flex: 1 }}>
        {activeNav === 'home'    && <HomeTab user={user} />}
        {activeNav === 'search'  && <SearchTab />}
        {activeNav === 'trips'   && <TripsTab user={user} />}
        {activeNav === 'profile' && <ProfileTab user={user} onLogout={logout} />}
      </View>

      {/* AtlasBot floating launcher */}
      <Pressable
        style={s.chatFab}
        onPress={() => (navigation as any).navigate('Chat')}
        accessibilityLabel="Ouvrir AtlasBot"
      >
        <Text style={{ fontSize: 22 }}>🤖</Text>
      </Pressable>

      {/* Bottom Nav */}
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
            accessibilityLabel={label}
          >
            <View style={[s.navIconWrap, activeNav === key && s.navIconActive]}>
              <Text style={{ fontSize: 18 }}>{icon}</Text>
            </View>
            <Text style={[s.navLabel, activeNav === key && s.navLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/* ─────────────────────── STYLES ─────────────────────── */
const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0B0704' },

  /* Hero */
  hero:         { backgroundColor: '#C1272D' },
  topBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  logoText:     { color: '#F5EDD8', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  tagline:      { color: 'rgba(245,237,216,0.6)', fontSize: 11, marginTop: 2 },
  topBtns:      { flexDirection: 'row', gap: 8 },
  topBtn:       { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  greeting:     { color: '#F5EDD8', fontSize: 18, fontWeight: '700', marginBottom: 2 },
  heroSub:      { color: 'rgba(245,237,216,0.65)', fontSize: 13, marginBottom: 16 },
  gpsBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(212,137,10,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,137,10,0.35)' },

  /* Search card */
  searchCard:   { backgroundColor: '#1C0C07', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(212,137,10,0.28)', marginBottom: 14 },
  searchRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 6 },
  dotGreen:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#006233', borderWidth: 2, borderColor: 'rgba(0,98,51,0.4)' },
  dotRed:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C1272D', borderWidth: 2, borderColor: 'rgba(193,39,45,0.4)' },
  fieldLabel:   { color: 'rgba(245,237,216,0.35)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  fieldVal:     { color: '#F5EDD8', fontSize: 15, fontWeight: '600', marginTop: 1 },
  fieldPh:      { color: 'rgba(245,237,216,0.3)', fontSize: 15, marginTop: 1 },
  swapRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 2 },
  swapLine:     { flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.15)' },
  swapBtn:      { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1C0C07', borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)', alignItems: 'center', justifyContent: 'center' },
  searchMeta:   { flexDirection: 'row', backgroundColor: 'rgba(212,137,10,0.06)', borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: 'rgba(212,137,10,0.12)' },
  metaBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 11, minHeight: 44 },
  metaIcon:     { fontSize: 14 },
  metaTxt:      { fontSize: 12, color: 'rgba(245,237,216,0.6)', fontWeight: '500' },
  metaDiv:      { width: 1, backgroundColor: 'rgba(212,137,10,0.15)' },
  searchBtn:    { backgroundColor: '#C1272D', borderRadius: 12, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  searchBtnTxt: { color: '#F5EDD8', fontWeight: '700', fontSize: 15 },

  /* Route map */
  routeMapCard:  { borderRadius: 14, overflow: 'hidden', backgroundColor: '#1C0C07', borderWidth: 1, borderColor: 'rgba(212,137,10,0.2)', marginBottom: 14 },
  routeMapTitle: { fontSize: 12, fontWeight: '700', color: '#D4890A', paddingHorizontal: 14, paddingVertical: 9 },

  /* Body */
  body:         { backgroundColor: '#0B0704', paddingHorizontal: 14, paddingBottom: 14 },
  section:      { marginTop: 22 },
  sectionHdr:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  sectionBadge: { fontSize: 10, fontWeight: '700', color: '#D4890A', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#F5EDD8' },
  seeAll:       { fontSize: 13, color: '#C1272D', fontWeight: '600' },

  /* Quick cards */
  quickCard:    { backgroundColor: '#1C0C07', borderRadius: 16, padding: 14, minWidth: 115, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,137,10,0.2)', marginRight: 10, borderTopWidth: 2, borderTopColor: '#C1272D' },
  quickFrom:    { fontSize: 12, fontWeight: '700', color: '#F5EDD8' },
  quickTo:      { fontSize: 12, fontWeight: '600', color: 'rgba(245,237,216,0.65)' },
  quickTime:    { fontSize: 11, color: 'rgba(245,237,216,0.4)', marginTop: 6 },
  quickPrice:   { fontSize: 14, fontWeight: '700', color: '#C1272D', marginTop: 4 },

  /* Promo */
  promo:        { backgroundColor: '#1C0C07', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 22, borderWidth: 1, borderColor: 'rgba(212,137,10,0.28)', borderLeftWidth: 3, borderLeftColor: '#D4890A' },
  promoTitle:   { color: '#F5EDD8', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  promoSub:     { color: 'rgba(245,237,216,0.5)', fontSize: 12 },
  promoCta:     { backgroundColor: 'rgba(212,137,10,0.12)', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)' },

  /* Filters */
  chip:          { borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#1C0C07', marginRight: 8 },
  chipActive:    { backgroundColor: '#C1272D', borderColor: '#C1272D' },
  chipTxt:       { fontSize: 12, color: 'rgba(245,237,216,0.5)', fontWeight: '500' },
  chipTxtActive: { color: '#fff', fontWeight: '700' },

  /* Trip cards */
  tripCard:        { backgroundColor: '#1C0C07', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)', marginTop: 12 },
  badgeInstant:    { backgroundColor: 'rgba(212,137,10,0.1)', borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  badgeInstantTxt: { fontSize: 11, color: '#D4890A', fontWeight: '600' },
  badgeToday:      { backgroundColor: 'rgba(0,98,51,0.1)', borderWidth: 1, borderColor: 'rgba(0,98,51,0.3)', borderRadius: 7, paddingHorizontal: 9, paddingVertical: 3 },
  badgeTodayTxt:   { fontSize: 11, color: '#4ade80', fontWeight: '500' },
  tlHour:   { fontSize: 12, fontWeight: '700', color: '#F5EDD8' },
  tlDotG:   { width: 9, height: 9, borderRadius: 5, backgroundColor: '#006233', marginVertical: 4 },
  tlDotR:   { width: 9, height: 9, borderRadius: 5, backgroundColor: '#C1272D', marginVertical: 4 },
  tlLine:   { flex: 1, width: 2, backgroundColor: 'rgba(212,137,10,0.15)', borderRadius: 1, minHeight: 20 },
  cityName: { fontSize: 15, fontWeight: '700', color: '#F5EDD8' },
  citySub:  { fontSize: 11, color: 'rgba(245,237,216,0.4)', marginTop: 1 },
  priceVal: { fontSize: 26, fontWeight: '800', color: '#C1272D', lineHeight: 28 },
  priceCur: { fontSize: 13, color: '#C1272D', fontWeight: '700' },
  priceLbl: { fontSize: 10, color: 'rgba(245,237,216,0.4)', marginTop: 2 },
  tdiv:     { height: 1, backgroundColor: 'rgba(212,137,10,0.1)', marginVertical: 12 },
  avatar:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  driverName:  { fontSize: 13, fontWeight: '700', color: '#F5EDD8' },
  driverMeta:  { fontSize: 11, color: 'rgba(245,237,216,0.45)', marginTop: 2 },
  seatsN:      { fontSize: 16, fontWeight: '700', color: '#F5EDD8' },
  seatsLbl:    { fontSize: 10, color: 'rgba(245,237,216,0.4)' },
  tripCta:     { backgroundColor: 'rgba(193,39,45,0.1)', borderWidth: 1, borderColor: 'rgba(193,39,45,0.3)', borderRadius: 10, height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  tripCtaTxt:  { color: '#C1272D', fontWeight: '700', fontSize: 13 },

  /* Publish */
  publish:      { backgroundColor: '#1C0C07', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', marginTop: 22, borderWidth: 1, borderColor: 'rgba(212,137,10,0.35)', borderLeftWidth: 3, borderLeftColor: '#C1272D' },
  publishTitle: { color: '#F5EDD8', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  publishSub:   { color: 'rgba(245,237,216,0.5)', fontSize: 11 },
  publishArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(212,137,10,0.12)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)' },

  /* Stats */
  stats:      { flexDirection: 'row', backgroundColor: '#1C0C07', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)', overflow: 'hidden', marginTop: 22 },
  stat:       { flex: 1, alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(212,137,10,0.12)' },
  statVal:    { fontSize: 16, fontWeight: '800', color: '#C1272D' },
  statLbl:    { fontSize: 10, color: 'rgba(245,237,216,0.4)', marginTop: 2 },

  /* How it works */
  howStep:  { flex: 1, backgroundColor: '#1C0C07', borderRadius: 14, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)', borderTopWidth: 2, borderTopColor: 'rgba(196,136,42,0.4)' },
  howNum:   { width: 24, height: 24, borderRadius: 12, backgroundColor: '#C1272D', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  howTitle: { fontSize: 12, fontWeight: '700', color: '#F5EDD8', marginBottom: 4, textAlign: 'center' },
  howDesc:  { fontSize: 10, color: 'rgba(245,237,216,0.45)', lineHeight: 14, textAlign: 'center' },

  /* AtlasBot FAB */
  chatFab: {
    position: 'absolute', right: 16, bottom: 96,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#C1272D', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.4)',
    shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6,
  },

  /* Bottom nav */
  bottomNav:     { flexDirection: 'row', backgroundColor: '#1C0C07', borderTopWidth: 1, borderTopColor: 'rgba(212,137,10,0.18)', paddingBottom: 20, paddingTop: 8 },
  navItem:       { flex: 1, alignItems: 'center', gap: 2 },
  navIconWrap:   { width: 40, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  navIconActive: { backgroundColor: 'rgba(193,39,45,0.15)' },
  navLabel:      { fontSize: 10, color: 'rgba(245,237,216,0.4)' },
  navLabelActive:{ color: '#C1272D', fontWeight: '700' },

  /* Search tab */
  cityInput:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#150906', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', paddingHorizontal: 14, height: 50 },
  cityInputFocus: { borderColor: '#D4890A' },
  cityDropdown:   { backgroundColor: '#150906', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', marginTop: 4, overflow: 'hidden' },
  citySearch:     { color: '#F5EDD8', fontSize: 14, padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(212,137,10,0.15)' },
  cityOption:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(212,137,10,0.08)' },
  cityOptionTxt:  { color: '#F5EDD8', fontSize: 14 },
  dateChip:       { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C0C07', borderWidth: 1, borderColor: 'rgba(212,137,10,0.2)' },
  dateChipActive: { backgroundColor: '#C1272D', borderColor: '#C1272D' },
  dateChipTxt:    { fontSize: 12, color: 'rgba(245,237,216,0.5)', fontWeight: '600' },
  dateChipTxtActive: { color: '#fff' },
  paxRow:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#150906', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', marginBottom: 16 },
  paxBtn:         { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  paxVal:         { flex: 1, textAlign: 'center', color: '#F5EDD8', fontSize: 15, fontWeight: '600' },
  destChip:       { backgroundColor: '#1C0C07', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(212,137,10,0.2)' },
  destChipTxt:    { fontSize: 12, color: 'rgba(245,237,216,0.65)' },

  /* Trips tab */
  innerTabs:       { flexDirection: 'row', backgroundColor: '#1C0C07', borderRadius: 12, padding: 4, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)' },
  innerTab:        { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  innerTabActive:  { backgroundColor: '#C1272D' },
  innerTabTxt:     { fontSize: 13, color: 'rgba(245,237,216,0.45)', fontWeight: '600' },
  innerTabTxtActive: { color: '#fff', fontWeight: '700' },
  emptyBox:        { alignItems: 'center', padding: 32, backgroundColor: '#1C0C07', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)', marginTop: 8 },
  emptyTitle:      { color: '#F5EDD8', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptySub:        { color: 'rgba(245,237,216,0.45)', fontSize: 13, textAlign: 'center', lineHeight: 20 },

  /* Profile tab */
  profileAvatar:    { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: '#D4890A', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  profileAvatarTxt: { color: '#fff', fontSize: 28, fontWeight: '800' },
  profileName:      { color: '#F5EDD8', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  profileEmail:     { color: 'rgba(245,237,216,0.55)', fontSize: 13, marginBottom: 16 },
  profileStats:     { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, overflow: 'hidden', alignSelf: 'stretch', marginHorizontal: 20 },
  profileStat:      { flex: 1, alignItems: 'center', paddingVertical: 12 },
  profileStatVal:   { color: '#fff', fontSize: 18, fontWeight: '800' },
  profileStatLbl:   { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 },
  verifiedBox:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,137,10,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)', padding: 14, marginBottom: 16 },
  verifyBtn:        { backgroundColor: 'rgba(212,137,10,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(212,137,10,0.3)' },
  menuCard:         { backgroundColor: '#1C0C07', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,137,10,0.18)', overflow: 'hidden', marginBottom: 12 },
  menuItem:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, minHeight: 60 },
  menuItemBorder:   { borderTopWidth: 1, borderTopColor: 'rgba(212,137,10,0.08)' },
  menuLabel:        { color: '#F5EDD8', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  menuSub:          { color: 'rgba(245,237,216,0.4)', fontSize: 11 },
  appVersion:       { textAlign: 'center', color: 'rgba(245,237,216,0.2)', fontSize: 11, marginBottom: 12 },
  logoutBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(193,39,45,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(193,39,45,0.25)', paddingVertical: 14 },
  logoutTxt:        { color: '#C1272D', fontSize: 15, fontWeight: '700' },
});
