import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useEffect } from 'react';
import AppLogo from '../../components/ui/AppLogo';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register, isAuthenticated } = useAuthStore();
  const { currentColors } = useThemeStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email invalide', "Veuillez entrer une adresse email existante et valide (ex: nom@gmail.com).");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, firstName, lastName });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error) {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de créer le compte');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  }, [isAuthenticated, navigation]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.logoWrap, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <AppLogo
                size={88}
              />
            </View>
            <Text style={[styles.appName, { color: currentColors.primary }]}>AtlasWay</Text>
            <Text style={[styles.title, { color: currentColors.text }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
              Rejoignez la communauté AtlasWay
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: currentColors.text }]}>Prénom</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }]}
                  placeholder="Ahmed"
                  placeholderTextColor={currentColors.textSecondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.label, { color: currentColors.text }]}>Nom</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }]}
                  placeholder="Benani"
                  placeholderTextColor={currentColors.textSecondary}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.text }]}>Email (doit être valide)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }]}
                placeholder="votre@email.com"
                placeholderTextColor={currentColors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.text }]}>Mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }]}
                placeholder="Min. 8 caractères"
                placeholderTextColor={currentColors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: currentColors.text }]}>Confirmer mot de passe</Text>
              <TextInput
                style={[styles.input, { backgroundColor: currentColors.surface, borderColor: currentColors.border, color: currentColors.text }]}
                placeholder="••••••••"
                placeholderTextColor={currentColors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: currentColors.primary }, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>S'inscrire</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: currentColors.textSecondary }]}>
              Déjà un compte ?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.link, { color: currentColors.primary }]}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrap: {
    width: 86,
    height: 86,
    borderRadius: 28,
    marginBottom: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  appName: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: { marginBottom: 24 },
  row: { flexDirection: 'row', gap: 14 },
  inputContainer: { marginBottom: 18 },
  halfWidth: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 2,
    letterSpacing: 0.3,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    fontSize: 16,
    borderWidth: 1.5,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  footerText: { fontSize: 15 },
  link: { fontSize: 15, fontWeight: '700' },
});
