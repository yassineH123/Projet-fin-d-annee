import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { createTrip } from '../../../services/trips';
import { ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type PublishTripScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PublishTrip'>;

export default function PublishTripScreen() {
  const { currentColors } = useThemeStore();
  const navigation = useNavigation<PublishTripScreenNavigationProp>();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('3');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handlePublish = async () => {
    if (!from || !to || !date || !price) {
      Alert.alert('Erreur', 'Veuillez remplir les champs obligatoires.');
      return;
    }

    const payload = {
      from,
      to,
      date: time ? `${date} ${time}` : date,
      price,
      seats: Number(seats) || 1,
      driver: user ? `${user.firstName} ${user.lastName}` : 'Anonyme',
    };

    setLoading(true);
    try {
      await createTrip(payload);
      Alert.alert('✅ Publié !', 'Votre trajet a été publié avec succès !', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Impossible de publier le trajet.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = [styles.inputRow, { backgroundColor: currentColors.surface, borderColor: currentColors.border }];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentColors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { backgroundColor: currentColors.surface, borderBottomColor: currentColors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={[styles.backArrow, { color: currentColors.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Détails du trajet</Text>
          <View style={styles.ph} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Itinéraire</Text>
          <View style={inputStyle}>
            <Text style={styles.icon}>📍</Text>
            <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="Ville de départ" placeholderTextColor={currentColors.textSecondary} value={from} onChangeText={setFrom} />
          </View>
          <View style={inputStyle}>
            <Text style={styles.icon}>🏁</Text>
            <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="Ville d'arrivée" placeholderTextColor={currentColors.textSecondary} value={to} onChangeText={setTo} />
          </View>

          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Date et heure</Text>
          <View style={styles.twoCol}>
            <View style={[inputStyle, styles.flex]}>
              <Text style={styles.icon}>📅</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="JJ/MM/AAAA" placeholderTextColor={currentColors.textSecondary} value={date} onChangeText={setDate} />
            </View>
            <View style={[inputStyle, styles.flex]}>
              <Text style={styles.icon}>⏰</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="HH:MM" placeholderTextColor={currentColors.textSecondary} value={time} onChangeText={setTime} />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Options</Text>
          <View style={styles.twoCol}>
            <View style={[inputStyle, styles.flex]}>
              <Text style={styles.icon}>💰</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="Prix (DH)" placeholderTextColor={currentColors.textSecondary} value={price} onChangeText={setPrice} keyboardType="number-pad" />
            </View>
            <View style={[inputStyle, styles.flex]}>
              <Text style={styles.icon}>💺</Text>
              <TextInput style={[styles.input, { color: currentColors.text }]} placeholder="Places" placeholderTextColor={currentColors.textSecondary} value={seats} onChangeText={setSeats} keyboardType="number-pad" />
            </View>
          </View>

          <TouchableOpacity style={[styles.publishBtn, { backgroundColor: currentColors.primary }]} onPress={handlePublish} activeOpacity={0.9} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishBtnText}>Publier le trajet</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
  backArrow: { fontSize: 26 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  ph: { width: 26 },
  scrollContent: { padding: 24, gap: 14, paddingBottom: 48 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2, marginTop: 8 },
  twoCol: { flexDirection: 'row', gap: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, height: 58 },
  icon: { fontSize: 20, marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '500' },
  publishBtn: { height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 16, elevation: 5, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12 },
  publishBtnText: { color: '#fff', fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
});