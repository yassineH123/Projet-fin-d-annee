import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import OtpInput from '../../components/OtpInput';
import { useCountdown } from '../../hooks/useCountdown';
import { resendCode, verifyEmail } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';

export default function VerifyCodeScreen({ route, navigation }: any) {
  const { saveSession } = useAuth();
  const email = route?.params?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { seconds, reset, isFinished } = useCountdown(60);

  const formattedTimer = useMemo(() => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
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
    <View style={{ flex: 1, backgroundColor: '#020617', padding: 24, justifyContent: 'center' }}>
      <Text style={{ color: '#60a5fa', letterSpacing: 2, fontWeight: '800', marginBottom: 12 }}>ATLASWAY</Text>
      <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 38 }}>Entrer le code de confirmation</Text>
      <Text style={{ color: '#94a3b8', marginTop: 12, marginBottom: 28 }}>Code envoyé à {email}</Text>

      <OtpInput
        value={code}
        onChange={setCode}
        onComplete={(value) => {
          setCode(value);
          handleVerify(value);
        }}
      />

      <Pressable
        onPress={() => handleVerify()}
        style={{
          marginTop: 24,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: code.length === 6 ? '#3b82f6' : '#1e293b',
        }}
        disabled={loading || code.length !== 6}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '800' }}>Vérifier</Text>}
      </Pressable>

      <Pressable onPress={handleResend} disabled={!isFinished || resending} style={{ marginTop: 18 }}>
        <Text style={{ color: isFinished ? '#60a5fa' : '#475569', fontWeight: '700', textAlign: 'center' }}>
          {resending ? 'Renvoi...' : isFinished ? 'Renvoyer le code' : `Renvoyer dans ${formattedTimer}`}
        </Text>
      </Pressable>
    </View>
  );
}
