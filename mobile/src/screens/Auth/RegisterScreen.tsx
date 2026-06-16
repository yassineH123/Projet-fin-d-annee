import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { register, verifyEmail } from '../../services/auth';
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
  textMuted:   'rgba(245,237,216,0.38)',
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

export default function RegisterScreen({ navigation }: any) {
  const { saveSession } = useAuth();
  const [step,      setStep]      = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [otp,       setOtp]       = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      console.log('[REGISTER] Envoi requête...');
      const result = await register({ firstName, lastName, email: email.trim(), password });
      console.log('[REGISTER] Succès:', JSON.stringify(result));
      setStep(2);
    } catch (err: any) {
      console.log('[REGISTER] Erreur:', JSON.stringify(err?.message), err?.code, err?.response?.status);
      const msg = err?.response?.data?.message
        || (err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK'
            ? 'Serveur inaccessible — démarrez le backend'
            : "Erreur d'inscription");
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const data = await verifyEmail(email.trim(), otp);
      await saveSession(data.token, data.user);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Code invalide');
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

        <Text style={s.title}>
          {step === 1 ? 'Inscription' : 'Vérification'}
        </Text>
        <Text style={s.subtitle}>
          {step === 1 ? 'Créez votre compte AtlasWay' : `Code envoyé à ${email}`}
        </Text>
      </View>

      {/* ── Card ── */}
      <View style={s.card}>
        <FlagBar />
        <View style={{ padding: 20 }}>

          {step === 1 ? (
            <>
              {/* Prénom + Nom */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Prénom</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Yassine"
                    placeholderTextColor={C.textMuted}
                    style={s.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>Nom</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Benali"
                    placeholderTextColor={C.textMuted}
                    style={s.input}
                  />
                </View>
              </View>

              {/* Email */}
              <Text style={s.label}>Adresse email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="vous@example.com"
                placeholderTextColor={C.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[s.input, { marginBottom: 16 }]}
              />

              {/* Mot de passe */}
              <Text style={s.label}>Mot de passe</Text>
              <View style={s.inputRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Min. 8 caractères"
                  placeholderTextColor={C.textMuted}
                  secureTextEntry={!showPwd}
                  style={{ flex: 1, color: C.text, paddingHorizontal: 16, height: 50, fontSize: 14 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPwd(!showPwd)}
                  style={s.eyeBtn}
                  accessibilityLabel={showPwd ? 'Masquer' : 'Afficher'}
                >
                  {showPwd ? <EyeOffIcon color={C.textMuted} /> : <EyeIcon color={C.textMuted} />}
                </TouchableOpacity>
              </View>

              {/* Bouton */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                style={[s.btn, loading && { opacity: 0.75 }]}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnTxt}>Créer mon compte</Text>}
              </Pressable>

              {/* Divider */}
              <View style={s.divider}>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.15)' }} />
                <Text style={{ color: C.textMuted, fontSize: 12, marginHorizontal: 12 }}>ou</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.15)' }} />
              </View>

              {/* Login link */}
              <Text style={{ textAlign: 'center', color: C.textSec, fontSize: 13 }}>
                Déjà un compte ?{' '}
                <Text
                  onPress={() => navigation.navigate('Login')}
                  style={{ color: C.gold, fontWeight: '700' }}
                >
                  Se connecter
                </Text>
              </Text>
            </>
          ) : (
            <>
              {/* Step 2 — OTP */}
              <View style={s.otpInfo}>
                <Text style={{ fontSize: 28 }}>📧</Text>
                <Text style={s.otpInfoTxt}>
                  Entrez le code à 6 chiffres reçu par email
                </Text>
              </View>

              <TextInput
                value={otp}
                onChangeText={v => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                placeholder="— — — — — —"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={6}
                style={s.otpInput}
              />

              <Pressable
                onPress={handleVerify}
                disabled={loading || otp.length !== 6}
                style={[s.btn, (loading || otp.length !== 6) && { opacity: 0.45 }]}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.btnTxt}>Vérifier le code</Text>}
              </Pressable>

              <TouchableOpacity
                onPress={() => setStep(1)}
                style={s.backBtn}
                accessibilityLabel="Retour"
              >
                <Text style={{ color: C.textMuted, fontSize: 14 }}>← Retour</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <Text style={s.terms}>
        En créant un compte, vous acceptez nos conditions d'utilisation.
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
  subtitle:    { color: 'rgba(245,237,216,0.45)', fontSize: 13, textAlign: 'center' },

  card: {
    backgroundColor: '#1C0C07', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.28)',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, elevation: 10,
  },
  label: {
    color: 'rgba(245,237,216,0.65)', fontSize: 12, fontWeight: '600',
    marginBottom: 6, letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#150906', color: '#F5EDD8', borderRadius: 12,
    paddingHorizontal: 16, height: 50, borderWidth: 1,
    borderColor: 'rgba(212,137,10,0.22)', fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#150906', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.22)', marginBottom: 20,
  },
  eyeBtn:  { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  btn: {
    height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C1272D',
    shadowColor: '#C1272D', shadowOpacity: 0.4, shadowRadius: 12, elevation: 5,
  },
  btnTxt:  { color: '#fff', fontWeight: '700', fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },

  /* OTP step */
  otpInfo:    { alignItems: 'center', gap: 8, marginBottom: 20, padding: 16, backgroundColor: 'rgba(212,137,10,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,137,10,0.15)' },
  otpInfoTxt: { color: 'rgba(245,237,216,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  otpInput:   {
    backgroundColor: '#150906', color: '#F5EDD8', borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.35)',
    height: 68, textAlign: 'center', fontSize: 28, fontWeight: '900',
    letterSpacing: 14, marginBottom: 20,
  },
  backBtn: { alignItems: 'center', marginTop: 16, paddingVertical: 8 },
  terms:   { textAlign: 'center', color: 'rgba(245,237,216,0.2)', fontSize: 11, marginTop: 20 },
});