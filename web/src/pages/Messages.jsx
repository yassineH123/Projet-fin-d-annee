import { useEffect, useState, useRef, useCallback } from 'react';
import { Send, MessageSquare, Users, Smile } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

const SOCKET_URL = 'http://localhost:4000';
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

/* ── helpers ─────────────────────────────────────────── */
function Avatar({ user, size = 'w-10 h-10', fontSize = 'text-sm' }) {
  return user?.photo
    ? <img src={user.photo} alt="" className={`${size} rounded-full object-cover flex-shrink-0`} />
    : <div className={`${size} rounded-full flex items-center justify-center text-white font-black flex-shrink-0 ${fontSize}`}
        style={{ background: 'linear-gradient(135deg,#C1272D,#D4890A)' }}>
        {user?.firstName?.[0] || '?'}
      </div>;
}

function GroupIcon({ members = [] }) {
  const shown = members.slice(0, 3);
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(193,39,45,0.15)' }}>
      <Users size={18} style={{ color: '#C1272D' }} />
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const withId    = searchParams.get('with');
  const withName  = searchParams.get('name')  || '';
  const withPhoto = searchParams.get('photo') || '';

  const [convs,    setConvs]    = useState([]);
  const [active,   setActive]   = useState(null);
  const [msgs,     setMsgs]     = useState([]);
  const [text,     setText]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [pending,  setPending]  = useState(null);
  const [typing,   setTyping]   = useState(false);
  const [emojiPicker, setEmojiPicker] = useState(null); // messageId

  const bottomRef    = useRef();
  const activeIdRef  = useRef(null);
  const socketRef    = useRef(null);
  const typingTimer  = useRef(null);

  /* ── Socket.io ─────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL, { query: { userId: user.id }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('new_message', ({ message, conversationId }) => {
      if (conversationId === activeIdRef.current) {
        setMsgs(prev => [...prev, message]);
      }
      setConvs(prev => prev.map(c =>
        c.id === conversationId ? { ...c, messages: [message], lastMessageAt: message.createdAt } : c
      ));
    });

    socket.on('message_reaction', ({ messageId, reactions }) => {
      setMsgs(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
    });

    socket.on('user_typing',      ({ conversationId }) => { if (conversationId === activeIdRef.current) setTyping(true); });
    socket.on('user_stop_typing', ({ conversationId }) => { if (conversationId === activeIdRef.current) setTyping(false); });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  /* ── Join / leave conversation room ────────────────── */
  useEffect(() => {
    if (!active || !socketRef.current) return;
    socketRef.current.emit('join_conversation', active.id);
    return () => socketRef.current?.emit('leave_conversation', active.id);
  }, [active?.id]);

  /* ── Load conversations ─────────────────────────────── */
  const loadConversations = useCallback(() =>
    api.get('/messages/conversations').then(({ data }) => data.conversations), []);

  useEffect(() => {
    loadConversations().then(conversations => {
      const filtered = conversations.filter(c => c.participant1Id !== c.participant2Id || c.type === 'group');
      setConvs(filtered);

      if (withId) {
        const existing = conversations.find(c =>
          c.type === 'direct' && (c.participant1Id === withId || c.participant2Id === withId)
        );
        if (existing) { setActive(existing); setPending(null); }
        else           { setPending({ receiverId: withId, name: withName, photo: withPhoto }); setMsgs([]); }
      }
    }).finally(() => setLoading(false));
  }, []);

  /* ── Load messages ──────────────────────────────────── */
  const fetchMsgs = useCallback((convId, markRead = false) => {
    const url = `/messages/conversations/${convId}${markRead ? '' : '?markRead=false'}`;
    api.get(url).then(({ data }) => setMsgs(data.messages || []));
  }, []);

  useEffect(() => {
    if (!active) { activeIdRef.current = null; return; }
    activeIdRef.current = active.id;
    fetchMsgs(active.id, true);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  /* ── Helpers ─────────────────────────────────────────── */
  const getOther = (conv) =>
    conv.participant1Id === user.id ? conv.participant2 : conv.participant1;

  const getConvInfo = (conv) => {
    if (conv?.type === 'group') {
      const memberUsers = conv.members?.map(m => m.user) || [];
      return { name: conv.name || 'Groupe', photo: null, isGroup: true, members: memberUsers };
    }
    const other = getOther(conv);
    return { name: `${other?.firstName || ''} ${other?.lastName || ''}`.trim(), photo: other?.photo, isGroup: false, other };
  };

  const activeInfo = active ? getConvInfo(active)
    : pending ? { name: withName, photo: withPhoto, isGroup: false }
    : null;

  /* ── Send message ────────────────────────────────────── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const body = pending
        ? { receiverId: pending.receiverId, content: text.trim() }
        : active?.type === 'group'
          ? { conversationId: active.id, content: text.trim() }
          : { receiverId: getOther(active).id, content: text.trim() };

      const { data } = await api.post('/messages', body);
      setText('');

      if (pending) {
        const convs2 = await loadConversations();
        setConvs(convs2.filter(c => c.participant1Id !== c.participant2Id || c.type === 'group'));
        const created = convs2.find(c => c.id === data.conversationId);
        if (created) { setActive(created); setPending(null); }
        fetchMsgs(data.conversationId, true);
      } else {
        setMsgs(prev => [...prev, data.message]);
      }

      clearTimeout(typingTimer.current);
      if (active && socketRef.current) socketRef.current.emit('stop_typing', { conversationId: active.id });
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally { setSending(false); }
  };

  /* ── Typing ──────────────────────────────────────────── */
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (active && socketRef.current) {
      socketRef.current.emit('typing', { conversationId: active.id, userId: user.id });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() =>
        socketRef.current?.emit('stop_typing', { conversationId: active.id }), 1500
      );
    }
  };

  /* ── Reactions ───────────────────────────────────────── */
  const reactToMessage = async (msgId, emoji) => {
    try { await api.post(`/messages/${msgId}/react`, { emoji }); }
    catch { toast.error('Erreur réaction'); }
    setEmojiPicker(null);
  };

  const groupedReactions = (reactions = []) =>
    reactions.reduce((acc, r) => ({ ...acc, [r.emoji]: (acc[r.emoji] || []).concat(r.userId) }), {});

  if (loading) return <Spinner />;

  /* ─── Render ──────────────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 h-[calc(100vh-90px)] flex flex-col">
      <h1 className="text-2xl font-black text-white mb-4">Messages</h1>

      <div className="flex gap-4 flex-1 min-h-0">

        {/* ── Sidebar ── */}
        <div className="w-72 shrink-0 flex flex-col gap-2 overflow-y-auto">
          {pending && (
            <div className="card border-primary-500/60 bg-primary-500/5">
              <div className="flex items-center gap-3">
                {withPhoto ? <img src={withPhoto} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <div className="w-10 h-10 rounded-full bg-primary-700 flex items-center justify-center font-bold text-white">{withName?.[0]}</div>}
                <div>
                  <p className="font-semibold text-white text-sm">{withName}</p>
                  <p className="text-slate-500 text-xs">Nouvelle conversation</p>
                </div>
              </div>
            </div>
          )}

          {convs.length === 0 && !pending ? (
            <div className="card text-center py-8">
              <MessageSquare size={32} className="text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">Aucune conversation</p>
              <Link to="/friends" className="text-xs text-primary-400 hover:underline mt-1 block">
                Trouver des amis →
              </Link>
            </div>
          ) : convs.map(conv => {
            const info    = getConvInfo(conv);
            const lastMsg = conv.messages?.[0];
            const isAct   = active?.id === conv.id;
            return (
              <button key={conv.id} onClick={() => { setActive(conv); setPending(null); }}
                className="card text-left transition-all"
                style={{ borderColor: isAct ? 'rgba(193,39,45,0.6)' : 'var(--border-color)', background: isAct ? 'rgba(193,39,45,0.05)' : 'var(--card-bg)' }}>
                <div className="flex items-center gap-3">
                  {info.isGroup ? <GroupIcon members={info.members} /> : <Avatar user={{ firstName: info.name, photo: info.photo }} />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">{info.name}</p>
                    {lastMsg && <p className="text-slate-500 text-xs truncate">{lastMsg.content}</p>}
                  </div>
                  {info.isGroup && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold"
                    style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D' }}>Groupe</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Chat window ── */}
        <div className="flex-1 flex flex-col card min-h-0">
          {(active || pending) ? (
            <>
              {/* Header */}
              <div className="border-b pb-3 mb-3 flex items-center gap-3" style={{ borderColor: 'var(--border-color)' }}>
                {activeInfo?.isGroup
                  ? <GroupIcon />
                  : <Avatar user={{ firstName: activeInfo?.name, photo: activeInfo?.photo }} size="w-8 h-8" fontSize="text-xs" />
                }
                <div>
                  <p className="font-semibold text-white">{activeInfo?.name}</p>
                  {activeInfo?.isGroup && activeInfo.members?.length > 0 && (
                    <p className="text-xs text-slate-500">
                      {activeInfo.members.map(m => m.firstName).join(', ')}
                    </p>
                  )}
                </div>
                {activeInfo?.other && (
                  <Link to={`/profile/${activeInfo.other.id}`}
                    className="ml-auto text-xs px-2 py-1 rounded-lg transition-all"
                    style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Voir profil
                  </Link>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 px-1">
                {msgs.length === 0 && pending && (
                  <p className="text-slate-600 text-sm text-center mt-8">
                    Envoyez votre premier message à {pending.name.split(' ')[0]}
                  </p>
                )}
                {msgs.map(m => {
                  const mine = m.senderId === user.id;
                  const grouped = groupedReactions(m.reactions || []);
                  const showPicker = emojiPicker === m.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'} group`}>
                      {/* Sender name for groups */}
                      {active?.type === 'group' && !mine && (
                        <p className="text-xs text-slate-500 mb-0.5 px-1">{m.sender?.firstName}</p>
                      )}

                      <div className="relative max-w-[70%]">
                        {/* Emoji picker toggle */}
                        <button
                          onClick={() => setEmojiPicker(showPicker ? null : m.id)}
                          className="absolute opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity top-0 z-10 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
                          style={{ [mine ? 'left' : 'right']: '-32px' }}
                          aria-label="Réagir avec un emoji">
                          <Smile size={16} className="text-slate-500 hover:text-white" />
                        </button>

                        {/* Emoji picker */}
                        {showPicker && (
                          <div className="absolute z-20 flex gap-1 p-2 rounded-xl shadow-xl"
                            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', [mine ? 'right' : 'left']: 0, top: '-48px' }}>
                            {EMOJIS.map(e => (
                              <button key={e} onClick={() => reactToMessage(m.id, e)}
                                className="w-8 h-8 flex items-center justify-center text-base hover:scale-125 transition-transform rounded-lg hover:bg-white/10"
                                aria-label={`Réagir avec ${e}`}>
                                {e}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Bubble */}
                        <div className={`px-4 py-2 rounded-2xl text-sm ${mine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                          style={{ background: mine ? '#C1272D' : 'var(--bg-700)', color: mine ? 'white' : 'var(--text-base)' }}>
                          {m.content}
                        </div>

                        {/* Reactions */}
                        {Object.keys(grouped).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(grouped).map(([emoji, uids]) => {
                              const myReaction = uids.includes(user.id);
                              return (
                                <button key={emoji} onClick={() => reactToMessage(m.id, emoji)}
                                  className="text-xs px-1.5 py-0.5 rounded-full transition-all"
                                  style={{
                                    background: myReaction ? 'rgba(193,39,45,0.18)' : 'var(--bg-700)',
                                    border: `1px solid ${myReaction ? 'rgba(193,39,45,0.4)' : 'var(--border-color)'}`,
                                    color: 'var(--text-base)',
                                  }}>
                                  {emoji}{uids.length > 1 ? ` ${uids.length}` : ''}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex items-start gap-2">
                    <div className="px-4 py-2 rounded-2xl rounded-bl-md flex gap-1 items-center"
                      style={{ background: 'var(--bg-700)' }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input value={text} onChange={handleTextChange}
                  placeholder="Écrire un message…" className="input flex-1 text-sm" />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4 py-2.5">
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-2">Sélectionnez une conversation</p>
                <Link to="/friends" className="text-sm text-primary-400 hover:underline">
                  Voir mes amis →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
