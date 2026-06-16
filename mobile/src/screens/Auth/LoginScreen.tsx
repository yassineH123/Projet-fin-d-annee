import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { login } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

const EyeIcon    = ({ color }: { color: string }) => <Text style={{ fontSize: 16, color }}>👁</Text>;
const EyeOffIcon = ({ color }: { color: string }) => <Text style={{ fontSize: 16, color }}>🚫</Text>;

/* ── Palette identique au Web ── */
const C = {
  bg:          '#0F0704',
  card:        '#1C0C07',
  border:      'rgba(212,137,10,0.28)',
  input:       '#150906',
  inputBorder: 'rgba(212,137,10,0.22)',
  red:         '#C1272D',
  gold:        '#D4890A',
  text:        '#F5EDD8',
  textSec:     'rgba(245,237,216,0.65)',
  textMuted:   'rgba(245,237,216,0.4)',
  errorTxt:    '#f87171',
  errorBg:     'rgba(239,68,68,0.10)',
  errorBorder: 'rgba(239,68,68,0.30)',
};

function FlagBar() {
  return (
    <View style={{ height: 3, flexDirection: 'row' }}>
      {['#B8232A', '#D4890A', '#005A2E', '#D4890A', '#B8232A'].map((c, i) => (
        <View key={i} style={{ flex: i === 1 || i === 3 ? 0.4 : 1, backgroundColor: c }} />
      ))}
    </View>
  );
}

export default function LoginScreen({ navigation }: any) {
  const { saveSession } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await login(email.trim(), password);
      await saveSession(response.token, response.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erreur de connexion';
      if (msg.toLowerCase().includes('non vérifié')) {
        navigation.navigate('VerifyCode', { email: email.trim() });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Logo ── */}
      <View style={{ alignItems: 'center', marginBottom: 36 }}>
        <View style={s.logoCircle}>
          <Text style={{ color: C.gold, fontSize: 26 }}>✦</Text>
        </View>

        <Text style={s.brand}>
          Atlas<Text style={{ color: C.gold }}>Way</Text>
        </Text>
        <Text style={s.arabic}>رفيق الطريق في المغرب</Text>

        <View style={s.dividerSmall}>
          <View style={s.divLine} />
          <Text style={{ color: C.gold, fontSize: 10 }}>✦</Text>
          <View style={s.divLine} />
        </View>

        <Text style={s.title}>Connexion</Text>
        <Text style={s.subtitle}>Accédez à votre compte AtlasWay</Text>
      </View>

      {/* ── Card ── */}
      <View style={s.card}>
        <FlagBar />
        <View style={{ padding: 20 }}>

          {!!error && (
            <View style={s.errorBox}>
              <Text style={{ fontSize: 14 }}>⚠️</Text>
              <Text style={s.errorTxt}>{error}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={s.label}>Adresse email</Text>
          <TextInput
            value={email}
            onChangeText={v => { setEmail(v); if (error) setError(''); }}
            placeholder="vous@example.com"
            placeholderTextColor={C.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[s.input, !!error && s.inputErr]}
          />

          {/* Mot de passe */}
          <Text style={s.label}>Mot de passe</Text>
          <View style={[s.inputRow, !!error && s.inputErr]}>
            <TextInput
              value={password}
              onChangeText={v => { setPassword(v); if (error) setError(''); }}
              placeholder="••••••••"
              placeholderTextColor={C.textMuted}
              secureTextEntry={!showPwd}
              style={{ flex: 1, color: C.text, paddingHorizontal: 16, height: 50, fontSize: 14 }}
            />
            <TouchableOpacity
              onPress={() => setShowPwd(!showPwd)}
              style={s.eyeBtn}
              accessibilityLabel={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPwd ? <EyeOffIcon color={C.textMuted} /> : <EyeIcon color={C.textMuted} />}
            </TouchableOpacity>
          </View>

          {/* Bouton */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[s.btn, loading && { opacity: 0.75 }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnTxt}>Se connecter</Text>}
          </Pressable>

          {/* Séparateur */}
          <View style={s.divider}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.15)' }} />
            <Text style={{ color: C.textMuted, fontSize: 12, marginHorizontal: 12 }}>ou</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.15)' }} />
          </View>

          {/* Inscription */}
          <Text style={{ textAlign: 'center', color: C.textSec, fontSize: 13 }}>
            Pas encore de compte ?{' '}
            <Text
              onPress={() => navigation.navigate('Register')}
              style={{ color: C.gold, fontWeight: '700' }}
            >
              Créer un compte
            </Text>
          </Text>
        </View>
      </View>

      <Text style={s.terms}>
        En vous connectant, vous acceptez nos conditions d'utilisation.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  logoCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(184,35,42,0.12)',
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#B8232A', shadowOpacity: 0.4, shadowRadius: 16, elevation: 6,
  },
  brand:       { color: '#F5EDD8', fontSize: 30, fontWeight: '700', letterSpacing: 1 },
  arabic:      { color: 'rgba(212,137,10,0.7)', fontSize: 13, marginTop: 4, letterSpacing: 1 },
  dividerSmall:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14, width: 80 },
  divLine:     { flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.3)' },
  title:       { color: '#F5EDD8', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle:    { color: 'rgba(245,237,216,0.45)', fontSize: 13 },

  card: {
    backgroundColor: '#1C0C07', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.28)',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, elevation: 10,
  },
  label: { color: 'rgba(245,237,216,0.65)', fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.3 },
  input: {
    backgroundColor: '#150906', color: '#F5EDD8', borderRadius: 12,
    paddingHorizontal: 16, height: 50, borderWidth: 1,
    borderColor: 'rgba(212,137,10,0.22)', marginBottom: 16, fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#150906', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', marginBottom: 20,
  },
  inputErr: { borderColor: 'rgba(239,68,68,0.5)' },
  eyeBtn:  { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: 'rgba(239,68,68,0.10)', borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.30)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20,
  },
  errorTxt: { color: '#f87171', fontSize: 13, flex: 1 },
  btn: {
    height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C1272D',
    shadowColor: '#C1272D', shadowOpacity: 0.4, shadowRadius: 12, elevation: 5,
  },
  btnTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  terms:   { textAlign: 'center', color: 'rgba(245,237,216,0.2)', fontSize: 11, marginTop: 20 },
});