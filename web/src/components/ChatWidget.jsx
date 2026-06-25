import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Zap } from 'lucide-react';
import api from '../services/api';

const WELCOME = {
  role: 'assistant',
  content: "Salam ! 👋 Je suis **AtlasBot**, votre assistant AtlasWay.\n\nJe peux vous aider avec :\n• 🗺️ Rechercher un trajet\n• 💰 Connaître les prix\n• 🚗 Devenir conducteur\n• 🔒 Questions de sécurité\n\nPosez-moi votre question !",
  time: new Date(),
};

const INITIAL_QUICK_REPLIES = [
  'Prix des trajets 💰',
  'Comment réserver ? 🎟️',
  'Devenir conducteur 🚗',
  'Sécurité sur AtlasWay 🔒',
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/•/g, '•')
    .replace(/\n/g, '<br/>');
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('fr-MA', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [quickReplies, setQuickReplies] = useState(INITIAL_QUICK_REPLIES);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open, loading]);

  const sendMessage = async (content) => {
    if (!content.trim() || loading) return;

    const history = messages
      .filter((m) => m !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content, time: new Date() }]);
    setText('');
    setError('');
    setQuickReplies([]);
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: content, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, time: new Date() }]);
      if (data.quickReplies?.length) setQuickReplies(data.quickReplies);
      if (!open) setUnread((n) => n + 1);
    } catch (err) {
      setError(err.response?.data?.message || 'AtlasBot est momentanément indisponible. Réessayez dans un instant.');
      setQuickReplies(INITIAL_QUICK_REPLIES);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(text);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="AtlasBot"
        aria-label={open ? 'Fermer AtlasBot' : 'Ouvrir AtlasBot'}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white transition-all"
        style={{
          background: 'linear-gradient(135deg,#D4890A,#C1272D)',
          boxShadow: '0 4px 24px rgba(212,137,10,0.5)',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: '#C1272D' }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed right-6 z-[60] rounded-2xl overflow-hidden flex flex-col"
          style={{
            bottom: 168,
            width: 'min(380px, calc(100vw - 2rem))',
            height: 'min(560px, calc(100vh - 200px))',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.45)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(212,137,10,0.15), rgba(193,39,45,0.1))', borderBottom: '1px solid var(--border-color)' }}>
            <div className="relative">
              <div className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#D4890A,#C1272D)' }}>
                <Bot size={18} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                style={{ background: '#22C55E', borderColor: 'var(--card-bg)' }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-base)' }}>AtlasBot</p>
              <div className="flex items-center gap-1">
                <Zap size={10} style={{ color: '#22C55E' }} />
                <p className="text-[10px]" style={{ color: '#22C55E' }}>En ligne · Powered by Groq AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg transition-all hover:opacity-70"
              style={{ color: 'var(--text-muted)' }} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-3 py-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => {
              const mine = m.role === 'user';
              return (
                <div key={i} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3.5 py-2.5 rounded-2xl text-sm max-w-[88%] ${mine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                    style={{
                      background: mine ? 'linear-gradient(135deg,#C1272D,#9B1E24)' : 'var(--bg-700)',
                      color: mine ? 'white' : 'var(--text-base)',
                      lineHeight: 1.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }}
                  />
                  {m.time && (
                    <span className="text-[10px] mt-0.5 px-1" style={{ color: 'var(--text-muted)' }}>
                      {formatTime(m.time)}
                    </span>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#D4890A,#C1272D)' }}>
                  <Bot size={12} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md flex gap-1 items-center" style={{ background: 'var(--bg-700)' }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: '#D4890A', animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-center px-3 py-2 rounded-xl mx-2"
                style={{ color: '#C1272D', background: 'rgba(193,39,45,0.1)' }}>
                ⚠️ {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && !loading && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap flex-shrink-0"
              style={{ borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full transition-all"
                  style={{
                    background: 'rgba(212,137,10,0.1)',
                    color: '#D4890A',
                    border: '1px solid rgba(212,137,10,0.3)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212,137,10,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(212,137,10,0.1)')}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 p-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border-color)' }}>
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez votre message…"
              disabled={loading}
              className="input flex-1 text-sm"
              style={{ fontSize: 13 }}
            />
            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="px-3.5 py-2.5 rounded-xl text-white transition-all flex-shrink-0"
              style={{
                background: text.trim() && !loading ? 'linear-gradient(135deg,#D4890A,#C1272D)' : 'var(--bg-700)',
                opacity: text.trim() && !loading ? 1 : 0.5,
              }}
              aria-label="Envoyer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
