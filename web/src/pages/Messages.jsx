import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const withId    = searchParams.get('with');
  const withName  = searchParams.get('name') || '';
  const withPhoto = searchParams.get('photo') || '';

  const [convs,   setConvs]   = useState([]);
  const [active,  setActive]  = useState(null);
  const [msgs,    setMsgs]    = useState([]);
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState(null);
  const bottomRef   = useRef();
  const pollRef     = useRef(null);
  const activeIdRef = useRef(null);

  const loadConversations = () =>
    api.get('/messages/conversations').then(({ data }) => data.conversations);

  useEffect(() => {
    loadConversations().then((conversations) => {
      // Exclure les auto-conversations (même utilisateur des deux côtés)
      const filtered = conversations.filter(
        (c) => c.participant1Id !== c.participant2Id
      );
      setConvs(filtered);

      if (withId) {
        const existing = conversations.find(
          (c) => c.participant1Id === withId || c.participant2Id === withId
        );
        if (existing) {
          setActive(existing);
          setPending(null);
        } else {
          // No existing conversation → create a pending "virtual" one
          setPending({ receiverId: withId, name: withName, photo: withPhoto });
          setActive(null);
          setMsgs([]);
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  const fetchMsgs = useCallback((convId, markRead = false) => {
    const url = `/messages/conversations/${convId}${markRead ? '' : '?markRead=false'}`;
    api.get(url).then(({ data }) => {
      setMsgs(data.messages);
    });
  }, []);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (!active) { activeIdRef.current = null; return; }
    activeIdRef.current = active.id;
    // Premier chargement : marquer comme lu
    fetchMsgs(active.id, true);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Polls suivants : ne pas marquer comme lu (la navbar doit pouvoir détecter les nouveaux messages)
    pollRef.current = setInterval(() => {
      if (activeIdRef.current) fetchMsgs(activeIdRef.current, false);
    }, 5_000);
    return () => clearInterval(pollRef.current);
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const getOther = (conv) =>
    conv.participant1Id === user.id ? conv.participant2 : conv.participant1;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const receiverId = pending ? pending.receiverId : getOther(active).id;
      const { data } = await api.post('/messages', { receiverId, content: text.trim() });
      setText('');

      if (pending) {
        const conversations = await loadConversations();
        setConvs(conversations.filter((c) => c.participant1Id !== c.participant2Id));
        const created = conversations.find((c) => c.id === data.conversationId);
        if (created) { setActive(created); setPending(null); }
        fetchMsgs(data.conversationId, true);
      } else {
        fetchMsgs(active.id, true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner size="lg" />;

  // Resolve header info for the active panel
  const activeOther = active
    ? getOther(active)
    : pending
      ? { firstName: pending.name.split(' ')[0], lastName: pending.name.split(' ').slice(1).join(' '), photo: pending.photo }
      : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-90px)] flex flex-col">
      <h1 className="text-2xl font-black text-white mb-4">Messages</h1>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Conversations list */}
        <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto">
          {/* Pending (not yet sent) shows at top */}
          {pending && (
            <button
              className="card text-left border-primary-500/60 bg-primary-500/5"
            >
              <div className="flex items-center gap-3">
                {pending.photo
                  ? <img src={pending.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white shrink-0">{pending.name?.[0]}</div>
                }
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm">{pending.name}</p>
                  <p className="text-slate-500 text-xs">Nouvelle conversation</p>
                </div>
              </div>
            </button>
          )}

          {convs.length === 0 && !pending ? (
            <div className="card text-center py-8">
              <MessageSquare size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Aucune conversation</p>
            </div>
          ) : convs.map((conv) => {
            const other   = getOther(conv);
            const lastMsg = conv.messages?.[0];
            return (
              <button key={conv.id} onClick={() => { setActive(conv); setPending(null); }}
                className={`card text-left hover:border-primary-500/50 transition-all ${active?.id === conv.id ? 'border-primary-500/60 bg-primary-500/5' : ''}`}>
                <div className="flex items-center gap-3">
                  {other?.photo
                    ? <img src={other.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white shrink-0">{other?.firstName?.[0]}</div>
                  }
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{other?.firstName} {other?.lastName}</p>
                    {lastMsg && <p className="text-slate-500 text-xs truncate">{lastMsg.content}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col card min-h-0">
          {(active || pending) ? (
            <>
              <div className="border-b border-dark-500 pb-3 mb-3 flex items-center gap-3">
                {activeOther?.photo
                  ? <img src={activeOther.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                  : <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-sm font-bold text-white">{activeOther?.firstName?.[0]}</div>
                }
                <span className="font-semibold text-white">{activeOther?.firstName} {activeOther?.lastName}</span>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
                {msgs.length === 0 && pending && (
                  <p className="text-slate-600 text-sm text-center mt-8">
                    Envoyez votre premier message à {pending.name.split(' ')[0]}
                  </p>
                )}
                {msgs.map((m) => {
                  const mine = m.senderId === user.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${mine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-dark-700 text-slate-200 rounded-bl-md'}`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Écrire un message..." className="input flex-1 text-sm" />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4 py-2.5">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Sélectionnez une conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
