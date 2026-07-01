import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Pressable, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

const C = {
  bg:        '#0B0704',
  card:      '#1C0C07',
  border:    'rgba(212,137,10,0.18)',
  red:       '#C1272D',
  gold:      '#D4890A',
  text:      '#F5EDD8',
  textSec:   'rgba(245,237,216,0.65)',
  textMuted: 'rgba(245,237,216,0.38)',
  input:     '#150906',
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Salam ! 👋 Je suis AtlasBot, l'assistant AtlasWay. Posez-moi vos questions sur les réservations, les prix ou la sécurité.",
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const listRef = useRef<FlatList>(null);

  const send = async () => {
    const content = input.trim();
    if (!content || loading) return;

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));

    const userMsg: ChatMessage = { id: `${Date.now()}-user`, role: 'user', content };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: content, history });
      const botMsg: ChatMessage = { id: `${Date.now()}-bot`, role: 'assistant', content: data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'AtlasBot est momentanément indisponible. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => navigation.goBack()} style={s.backBtn} accessibilityLabel="Retour">
          <Text style={{ color: C.text, fontSize: 18 }}>←</Text>
        </Pressable>
        <View style={s.headerAvatar}>
          <Text style={{ fontSize: 16 }}>🤖</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>AtlasBot</Text>
          <Text style={s.headerSub}>Assistant AtlasWay</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={s.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <Text style={s.emptyTxt}>Démarrez la conversation avec AtlasBot.</Text>
          }
          renderItem={({ item }) => {
            const mine = item.role === 'user';
            return (
              <View style={[s.bubbleRow, mine ? s.bubbleRowMine : s.bubbleRowTheirs]}>
                <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleTheirs]}>
                  <Text style={[s.bubbleTxt, mine && { color: '#fff' }]}>{item.content}</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            loading ? (
              <View style={[s.bubbleRow, s.bubbleRowTheirs]}>
                <View style={[s.bubble, s.bubbleTheirs, s.typingBubble]}>
                  <ActivityIndicator size="small" color={C.gold} />
                  <Text style={s.typingTxt}>AtlasBot écrit…</Text>
                </View>
              </View>
            ) : null
          }
        />

        {!!error && <Text style={s.errorTxt}>{error}</Text>}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Écrivez votre message…"
            placeholderTextColor={C.textMuted}
            style={s.input}
            editable={!loading}
            multiline
            onSubmitEditing={send}
          />
          <Pressable
            onPress={send}
            disabled={loading || !input.trim()}
            style={[s.sendBtn, (loading || !input.trim()) && { opacity: 0.45 }]}
            accessibilityLabel="Envoyer"
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: C.card, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerAvatar: {
    width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(212,137,10,0.18)', borderWidth: 1, borderColor: 'rgba(212,137,10,0.35)',
  },
  headerTitle: { color: C.text, fontSize: 15, fontWeight: '700' },
  headerSub: { color: C.textSec, fontSize: 11 },

  listContent: { padding: 14, flexGrow: 1 },
  emptyTxt: { color: C.textMuted, fontSize: 13, textAlign: 'center', marginTop: 40 },

  bubbleRow: { flexDirection: 'row', marginBottom: 8 },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },

  bubble: { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMine: { backgroundColor: C.red, borderBottomRightRadius: 6 },
  bubbleTheirs: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 6 },
  bubbleTxt: { color: C.text, fontSize: 14, lineHeight: 20 },

  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingTxt: { color: C.textSec, fontSize: 12 },

  errorTxt: { color: C.red, fontSize: 12, textAlign: 'center', paddingHorizontal: 14, paddingBottom: 4 },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    padding: 10, backgroundColor: C.card, borderTopWidth: 1, borderTopColor: C.border,
  },
  input: {
    flex: 1, maxHeight: 100, color: C.text, fontSize: 14,
    backgroundColor: C.input, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: C.red,
    alignItems: 'center', justifyContent: 'center',
  },
});
