import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '../services/api';

const WELCOME = {
  role: 'assistant',
  content: "Salam ! 👋 Je suis AtlasBot, l'assistant AtlasWay. Posez-moi vos questions sur les réservations, les prix ou la sécurité.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || loading) return;

    const history = messages
      .filter((m) => m !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: 'user', content }]);
    setText('');
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { message: content, history });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.response?.data?.message || "AtlasBot est momentanément indisponible. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="AtlasBot"
        aria-label={open ? 'Fermer le chat AtlasBot' : 'Ouvrir le chat AtlasBot'}
        className="fixed bottom-24 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform"
        style={{ background: 'linear-gradient(135deg,#D4890A,#C1272D)', boxShadow: '0 4px 24px rgba(212,137,10,0.5)' }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {open && (
        <div
          className="fixed right-6 z-[60] rounded-2xl overflow-hidden flex flex-col"
          style={{
            bottom: 168,
            width: 'min(360px, calc(100vw - 2rem))',
            height: 'min(520px, calc(100vh - 200px))',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 48px rgba(0,0,0,0.45)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ background: 'rgba(212,137,10,0.12)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,137,10,0.2)' }}>
              <Bot size={16} style={{ color: '#D4890A' }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm leading-tight">AtlasBot</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Assistant AtlasWay</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg transition-all" style={{ color: 'var(--text-muted)' }} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 px-3 py-3" style={{ minHeight: 0 }}>
            {messages.length === 0 ? (
              <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
                Démarrez la conversation avec AtlasBot.
              </p>
            ) : (
              messages.map((m, i) => {
                const mine = m.role === 'user';
                return (
                  <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${mine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                      style={{ background: mine ? '#C1272D' : 'var(--bg-700)', color: mine ? 'white' : 'var(--text-base)' }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl rounded-bl-md flex gap-1 items-center" style={{ background: 'var(--bg-700)' }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p className="text-xs text-center mt-1" style={{ color: '#C1272D' }}>{error}</p>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrivez votre message…"
              disabled={loading}
              className="input flex-1 text-sm"
            />
            <button type="submit" disabled={loading || !text.trim()} className="btn-primary px-3.5 py-2.5" aria-label="Envoyer">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
