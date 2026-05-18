import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ActivityIndicator,
  ScrollView, TouchableOpacity,
} from 'react-native';
// Icons remplacés par Text pour éviter react-native-svg natif
const CarIcon   = () => <Text style={{ fontSize: 26 }}>🚗</Text>;
const EyeIcon   = ({ color }: any) => <Text style={{ fontSize: 16, color }}>👁</Text>;
const EyeOffIcon= ({ color }: any) => <Text style={{ fontSize: 16, color }}>🚫</Text>;
const AlertIcon = () => <Text style={{ fontSize: 14 }}>⚠️</Text>;
import { login } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

const C = {
  bg:        '#020617',
  card:      '#0f172a',
  border:    '#334155',
  primary:   '#3b82f6',
  primary4:  '#60a5fa',
  input:     '#111827',
  slate4:    '#94a3b8',
  slate3:    '#cbd5e1',
  white:     '#fff',
  red:       '#f87171',
  redBg:     'rgba(239,68,68,0.10)',
  redBorder: 'rgba(239,68,68,0.30)',
};

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
      {/* Logo + title */}
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View style={{
          width: 56, height: 56, borderRadius: 16,
          backgroundColor: 'rgba(59,130,246,0.10)',
          borderWidth: 1, borderColor: 'rgba(59,130,246,0.20)',
          alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <CarIcon />
        </View>
        <Text style={{ color: C.white, fontSize: 28, fontWeight: '900' }}>Connexion</Text>
        <Text style={{ color: C.slate4, fontSize: 14, marginTop: 6 }}>
          Accédez à votre compte AtlasWay
        </Text>
      </View>

      {/* Card */}
      <View style={{
        backgroundColor: C.card, borderRadius: 20,
        borderWidth: 1, borderColor: C.border, padding: 20,
      }}>
        {/* Error banner */}
        {!!error && (
          <View style={{
            flexDirection: 'row', alignItems: 'flex-start', gap: 10,
            backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBorder,
            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20,
          }}>
            <AlertIcon />
            <Text style={{ color: C.red, fontSize: 13, flex: 1 }}>{error}</Text>
          </View>
        )}

        {/* Email */}
        <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
          Adresse email
        </Text>
        <TextInput
          value={email}
          onChangeText={(v) => { setEmail(v); if (error) setError(''); }}
          placeholder="vous@example.com"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            backgroundColor: C.input, color: C.white, borderRadius: 12,
            paddingHorizontal: 16, height: 50, borderWidth: 1,
            borderColor: error ? C.redBorder : C.border, marginBottom: 16,
          }}
        />

        {/* Password */}
        <Text style={{ color: C.slate3, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>
          Mot de passe
        </Text>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: C.input, borderRadius: 12,
          borderWidth: 1, borderColor: error ? C.redBorder : C.border,
          marginBottom: 20,
        }}>
          <TextInput
            value={password}
            onChangeText={(v) => { setPassword(v); if (error) setError(''); }}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry={!showPwd}
            style={{ flex: 1, color: C.white, paddingHorizontal: 16, height: 50 }}
          />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ paddingRight: 14 }}>
            {showPwd
              ? <EyeOffIcon color={C.slate4} />
              : <EyeIcon color={C.slate4} />}
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={{
            height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
            backgroundColor: loading ? '#1d4ed8' : C.primary, opacity: loading ? 0.8 : 1,
          }}
        >
          {loading
            ? <ActivityIndicator color={C.white} />
            : <Text style={{ color: C.white, fontWeight: '700', fontSize: 15 }}>Se connecter</Text>}
        </Pressable>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ color: '#64748b', fontSize: 12, marginHorizontal: 12 }}>ou</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* Register link */}
        <Text style={{ textAlign: 'center', color: C.slate4, fontSize: 14 }}>
          Pas encore de compte ?{' '}
          <Text
            onPress={() => navigation.navigate('Register')}
            style={{ color: C.primary4, fontWeight: '700' }}
          >
            Créer un compte
          </Text>
        </Text>
      </View>

      <Text style={{ textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 20 }}>
        En vous connectant, vous acceptez nos conditions d'utilisation.
      </Text>
    </ScrollView>
  );
}
