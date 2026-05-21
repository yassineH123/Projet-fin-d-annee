import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
const CarIcon    = () => <Text style={{ fontSize: 28, marginBottom: 4 }}>🚗</Text>;
const EyeIcon    = ({ color }: any) => <Text style={{ fontSize: 16, color }}>👁</Text>;
const EyeOffIcon = ({ color }: any) => <Text style={{ fontSize: 16, color }}>🚫</Text>;
import { loginWithGoogle, register, verifyEmail } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_WEB_CLIENT_ID } from '../../utils/config';

const C = {
  bg:       '#020617',
  card:     '#0f172a',
  border:   '#334155',
  primary:  '#3b82f6',
  primary4: '#60a5fa',
  input:    '#111827',
  slate4:   '#94a3b8',
  slate3:   '#cbd5e1',
  white:    '#fff',
};

const inputStyle = {
  backgroundColor: C.input, color: C.white, borderRadius: 12,
  paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: C.border,
};

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
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register({ firstName, lastName, email: email.trim(), password });
      setStep(2);
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Erreur inscription');
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      if (!GOOGLE_WEB_CLIENT_ID || GOOGLE_WEB_CLIENT_ID === 'YOUR_GOOGLE_WEB_CLIENT_ID') {
        Alert.alert('Erreur', 'Google OAuth non configure.');
        return;
      }

      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      if (!idToken) throw new Error('Jeton Google manquant');
      const data = await loginWithGoogle(idToken);
      await saveSession(data.token, data.user);
    } catch (err: any) {
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      if (err?.code === statusCodes.IN_PROGRESS) return;
      if (err?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Erreur', 'Google Play Services indisponible.');
        return;
      }
      const msg = err?.response?.data?.message || err?.message || 'Erreur Google';
      Alert.alert('Erreur', msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Logo + title */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <CarIcon />
        <Text style={{ color: C.white, fontSize: 28, fontWeight: '900' }}>
          {step === 1 ? 'Inscription' : 'Vérification'}
        </Text>
        <Text style={{ color: C.slate4, fontSize: 14, marginTop: 6 }}>
          {step === 1 ? 'Créez votre compte AtlasWay' : `Code envoyé à ${email}`}
        </Text>
      </View>

      {/* Card */}
      <View style={{ backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20 }}>

        {step === 1 ? (
          <>
            <Pressable
              onPress={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                height: 48,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderWidth: 1,
                borderColor: C.border,
                marginBottom: 16,
                opacity: googleLoading ? 0.8 : 1,
              }}
            >
              {googleLoading
                ? <ActivityIndicator color="#0f172a" />
                : <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 15 }}>Continuer avec Google</Text>}
            </Pressable>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
              <Text style={{ color: '#64748b', fontSize: 12, marginHorizontal: 12 }}>ou</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            </View>

            {/* Prénom + Nom */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Prénom</Text>
                <TextInput value={firstName} onChangeText={setFirstName} placeholder="Yassine" placeholderTextColor="#64748b" style={inputStyle} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Nom</Text>
                <TextInput value={lastName} onChangeText={setLastName} placeholder="Benali" placeholderTextColor="#64748b" style={inputStyle} />
              </View>
            </View>

            {/* Email */}
            <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} placeholder="vous@example.com" placeholderTextColor="#64748b" autoCapitalize="none" keyboardType="email-address" style={{ ...inputStyle, marginBottom: 16 }} />

            {/* Password */}
            <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>Mot de passe</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.input, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginBottom: 20 }}>
              <TextInput value={password} onChangeText={setPassword} placeholder="Min. 8 caractères" placeholderTextColor="#64748b" secureTextEntry={!showPwd} style={{ flex: 1, color: C.white, paddingHorizontal: 16, height: 50 }} />
              <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ paddingRight: 14 }}>
                {showPwd ? <EyeOffIcon color={C.slate4} /> : <EyeIcon color={C.slate4} />}
              </TouchableOpacity>
            </View>

            <Pressable onPress={handleRegister} disabled={loading} style={{ height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, opacity: loading ? 0.8 : 1 }}>
              {loading ? <ActivityIndicator color={C.white} /> : <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>Créer mon compte</Text>}
            </Pressable>

            <Text style={{ textAlign: 'center', color: C.slate4, fontSize: 14, marginTop: 20 }}>
              Déjà un compte ?{' '}
              <Text onPress={() => navigation.navigate('Login')} style={{ color: C.primary4, fontWeight: '700' }}>Se connecter</Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={{ color: C.slate4, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
              Entrez le code à 6 chiffres reçu par email
            </Text>
            <TextInput
              value={otp}
              onChangeText={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="_ _ _ _ _ _"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={6}
              style={{ backgroundColor: C.input, color: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border, height: 64, textAlign: 'center', fontSize: 28, fontWeight: '900', letterSpacing: 12, marginBottom: 16 }}
            />
            <Pressable onPress={handleVerify} disabled={loading || otp.length !== 6} style={{ height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primary, opacity: (loading || otp.length !== 6) ? 0.5 : 1, marginBottom: 16 }}>
              {loading ? <ActivityIndicator color={C.white} /> : <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>Vérifier</Text>}
            </Pressable>
            <TouchableOpacity onPress={() => setStep(1)} style={{ alignItems: 'center' }}>
              <Text style={{ color: C.slate4, fontSize: 14 }}>← Retour</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}
