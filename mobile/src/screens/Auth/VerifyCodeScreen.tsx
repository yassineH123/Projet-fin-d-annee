import React, { useMemo, useState } from 'react';
import {
  View, Text, Pressable, ActivityIndicator, ScrollView, StyleSheet,
} from 'react-native';
import OtpInput from '../../components/OtpInput';
import { useCountdown } from '../../hooks/useCountdown';
import { resendCode, verifyEmail } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { Alert } from 'react-native';

const C = {
  bg:        '#0F0704',
  card:      '#1C0C07',
  border:    'rgba(212,137,10,0.28)',
  red:       '#C1272D',
  gold:      '#D4890A',
  text:      '#F5EDD8',
  textSec:   'rgba(245,237,216,0.65)',
  textMuted: 'rgba(245,237,216,0.38)',
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

export default function VerifyCodeScreen({ route, navigation }: any) {
  const { saveSession } = useAuth();
  const email = route?.params?.email || '';
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { seconds, reset, isFinished } = useCountdown(60);

  const formattedTimer = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, [seconds]);

  const handleVerify = async (otp: string = code) => {
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const response = await verifyEmail(email, otp);
      await saveSession(response.token, response.user);
      Alert.alert('Succès', 'Votre email a été vérifié.');
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isFinished) return;
    setResending(true);
    try {
      await resendCode(email);
      reset(60);
      Alert.alert('Code renvoyé', 'Un nouveau code a été envoyé.');
    } catch (error: any) {
      Alert.alert('Erreur', error?.response?.data?.message || 'Impossible de renvoyer le code');
    } finally {
      setResending(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo */}
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
        <Text style={s.title}>Vérification</Text>
        <Text style={s.subtitle}>Code envoyé à {email}</Text>
      </View>

      {/* Card */}
      <View style={s.card}>
        <FlagBar />
        <View style={{ padding: 20 }}>

          <View style={s.infoBox}>
            <Text style={{ fontSize: 28, marginBottom: 8 }}>📧</Text>
            <Text style={s.infoTxt}>
              Entrez le code à 6 chiffres reçu par email pour activer votre compte
            </Text>
          </View>

          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={(value) => { setCode(value); handleVerify(value); }}
          />

          <Pressable
            onPress={() => handleVerify()}
            disabled={loading || code.length !== 6}
            style={[s.btn, (loading || code.length !== 6) && { opacity: 0.45 }]}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.btnTxt}>Vérifier le code</Text>}
          </Pressable>

          <Pressable
            onPress={handleResend}
            disabled={!isFinished || resending}
            style={s.resendBtn}
          >
            {resending ? (
              <ActivityIndicator size="small" color={C.gold} />
            ) : (
              <Text style={[s.resendTxt, isFinished && s.resendActive]}>
                {isFinished ? '↺  Renvoyer le code' : `Renvoyer dans ${formattedTimer}`}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={{ color: C.textMuted, fontSize: 14 }}>← Retour</Text>
          </Pressable>
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
  brand:        { color: '#F5EDD8', fontSize: 30, fontWeight: '700', letterSpacing: 1 },
  arabic:       { color: 'rgba(212,137,10,0.7)', fontSize: 13, marginTop: 4, letterSpacing: 1 },
  dividerSmall: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 14, width: 80 },
  divLine:      { flex: 1, height: 1, backgroundColor: 'rgba(212,137,10,0.3)' },
  title:        { color: '#F5EDD8', fontSize: 22, fontWeight: '900', marginBottom: 4 },
  subtitle:     { color: 'rgba(245,237,216,0.45)', fontSize: 13, textAlign: 'center' },

  card: {
    backgroundColor: '#1C0C07', borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.28)',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 24, elevation: 10,
  },
  infoBox: {
    alignItems: 'center', padding: 16, marginBottom: 20,
    backgroundColor: 'rgba(212,137,10,0.06)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(212,137,10,0.15)',
  },
  infoTxt: { color: 'rgba(245,237,216,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  btn: {
    height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#C1272D', marginTop: 20,
    shadowColor: '#C1272D', shadowOpacity: 0.4, shadowRadius: 12, elevation: 5,
  },
  btnTxt:      { color: '#fff', fontWeight: '700', fontSize: 15 },
  resendBtn:   { alignItems: 'center', marginTop: 18, paddingVertical: 8 },
  resendTxt:   { color: 'rgba(245,237,216,0.35)', fontSize: 14, fontWeight: '600' },
  resendActive:{ color: '#D4890A' },
  backBtn:     { alignItems: 'center', marginTop: 8, paddingVertical: 8 },
  terms:       { textAlign: 'center', color: 'rgba(245,237,216,0.2)', fontSize: 11, marginTop: 20 },
});