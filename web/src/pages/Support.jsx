import { useState, useEffect } from 'react';
import { Headphones, Plus, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, MessageSquare, CreditCard, User, Car, Bug, HelpCircle, Send, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';

const CATEGORIES = [
  { id: 'bug',      label: 'Bug / Problème technique', icon: Bug,          color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
  { id: 'paiement', label: 'Paiement / Portefeuille',  icon: CreditCard,   color: '#D4890A', bg: 'rgba(212,137,10,0.08)'  },
  { id: 'compte',   label: 'Compte / Profil',           icon: User,         color: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
  { id: 'trajet',   label: 'Trajet / Réservation',      icon: Car,          color: '#C1272D', bg: 'rgba(193,39,45,0.08)'   },
  { id: 'autre',    label: 'Autre',                     icon: HelpCircle,   color: '#9C27B0', bg: 'rgba(156,39,176,0.08)'  },
];

const STATUS_META = {
  open:        { icon: AlertCircle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: 'Ouvert'   },
  in_progress: { icon: Clock,       color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: 'En cours' },
  resolved:    { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.1)',  label: 'Résolu'   },
  closed:      { icon: XCircle,     color: '#6B7280', bg: 'rgba(107,114,128,0.1)', label: 'Fermé'    },
};

const FAQ = [
  {
    q: 'Comment annuler une réservation ?',
    a: 'Allez dans "Réservations" → cliquez sur la réservation → "Annuler". Le remboursement dépend du délai : 100% si +48h avant, 50% entre 24h et 48h, non remboursable si moins de 24h.',
  },
  {
    q: 'Mon paiement n\'a pas été débité mais la réservation est confirmée ?',
    a: 'Le paiement est traité via Stripe. Si le montant n\'apparaît pas dans les 48h, contactez-nous avec votre numéro de réservation.',
  },
  {
    q: 'Comment devenir conducteur ?',
    a: 'Publiez votre premier trajet via "Publier un trajet". Vous aurez accès au tableau de bord conducteur après votre premier voyage complété.',
  },
  {
    q: 'Comment contacter mon conducteur/passager ?',
    a: 'Utilisez le système de messagerie intégré dans "Messages" ou directement depuis la page de la réservation.',
  },
  {
    q: 'Mon solde Wallet n\'est pas mis à jour ?',
    a: 'Les transactions peuvent prendre jusqu\'à quelques minutes. Rafraîchissez la page. Si le problème persiste après 1h, ouvrez un ticket.',
  },
];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

export default function Support() {
  const [tickets, setTickets]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [form,    setForm]     = useState({ subject: '', category: 'trajet', message: '' });
  const [saving,  setSaving]   = useState(false);
  const [open,    setOpen]     = useState(null);
  const [faqOpen, setFaqOpen]  = useState(null);
  const [selCat,  setSelCat]   = useState(null);

  const load = () => api.get('/support/me')
    .then(({ data }) => setTickets(data.tickets || []))
    .catch(() => setTickets([]))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) { toast.error('Remplissez tous les champs'); return; }
    setSaving(true);
    try {
      await api.post('/support', form);
      toast.success('Ticket créé ! Notre équipe vous répondra dans les 24h.');
      setForm({ subject: '', category: selCat || 'trajet', message: '' });
      setSelCat(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const selectCategory = (id) => {
    setSelCat(id);
    setForm(f => ({ ...f, category: id }));
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* ── Header ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 20, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '20px 22px', background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, transparent 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={22} style={{ color: '#3B82F6' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#3B82F6' }}>✦ AtlasWay</p>
              <h1 style={{ margin: '2px 0 0', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Support & Aide</h1>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Notre équipe répond en moins de 24h</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E80' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>En ligne</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Zap size={14} style={{ color: '#D4890A' }} /> Questions fréquentes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {FAQ.map((item, i) => (
              <div key={i} style={{
                borderRadius: 12, border: '1px solid var(--border-color)',
                background: faqOpen === i ? 'rgba(193,39,45,0.03)' : 'var(--bg-700)',
                overflow: 'hidden', transition: 'all 0.15s',
              }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', gap: 10,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'left', lineHeight: 1.4 }}>{item.q}</span>
                  {faqOpen === i ? <ChevronUp size={15} style={{ color: '#C1272D', flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                </button>
                {faqOpen === i && (
                  <div style={{ padding: '0 14px 14px' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Nouveau ticket ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Plus size={14} style={{ color: '#22C55E' }} /> Ouvrir un ticket
          </p>

          {/* Catégories visuelles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7, marginBottom: 16 }}>
            {CATEGORIES.map(({ id, label, icon: Icon, color, bg }) => (
              <button key={id} type="button" onClick={() => selectCategory(id)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: '10px 4px', borderRadius: 12, border: '1.5px solid',
                borderColor: selCat === id ? color : 'var(--border-color)',
                background: selCat === id ? bg : 'var(--bg-700)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <Icon size={16} style={{ color: selCat === id ? color : 'var(--text-muted)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: selCat === id ? color : 'var(--text-muted)', textAlign: 'center', lineHeight: 1.2, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  {label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Hidden select for form value */}
            <input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              className="input" placeholder="Sujet de votre demande" required maxLength={120}
              style={{ fontSize: 14 }}
            />
            <div style={{ position: 'relative' }}>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="input" rows={4}
                placeholder="Décrivez votre problème en détail (ID de réservation, étapes, captures d'écran…)"
                required maxLength={2000}
                style={{ resize: 'none', fontSize: 13, lineHeight: 1.6 }}
              />
              <span style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>
                {form.message.length}/2000
              </span>
            </div>

            <button type="submit" disabled={saving} style={{
              height: 48, borderRadius: 12, border: 'none',
              background: saving ? 'var(--bg-700)' : 'linear-gradient(135deg, #3B82F6, #1d4ed8)',
              color: saving ? 'var(--text-muted)' : '#fff',
              fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: saving ? 'none' : '0 4px 16px rgba(59,130,246,0.35)',
              transition: 'all 0.15s',
            }}>
              {saving
                ? <><span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Envoi…</>
                : <><Send size={15} /> Envoyer le ticket</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ── Mes tickets ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <MessageSquare size={14} style={{ color: '#C1272D' }} /> Mes tickets
            </p>
            {tickets.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: 'var(--bg-700)', color: 'var(--text-muted)' }}>
                {tickets.length}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner /></div>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>✅</p>
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Aucun ticket ouvert</p>
              <p style={{ fontSize: 12 }}>Tout va bien ! Ouvrez un ticket si vous avez besoin d'aide.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tickets.map(t => {
                const sm   = STATUS_META[t.status] || STATUS_META.open;
                const Icon = sm.icon;
                const cat  = CATEGORIES.find(c => c.id === t.category);
                return (
                  <div key={t.id} onClick={() => setOpen(open === t.id ? null : t.id)} style={{
                    borderRadius: 12, border: '1px solid var(--border-color)',
                    background: open === t.id ? 'rgba(193,39,45,0.03)' : 'var(--bg-700)',
                    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      {cat && (
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {<cat.icon size={16} style={{ color: cat.color }} />}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
                        <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                          {cat?.label} · {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 99, background: sm.bg, flexShrink: 0 }}>
                        <Icon size={12} style={{ color: sm.color }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: sm.color }}>{sm.label}</span>
                      </div>
                    </div>

                    {open === t.id && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: t.adminReply ? 12 : 0 }}>{t.message}</p>
                        {t.adminReply && (
                          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 800, color: '#10B981' }}>✓ Réponse de l'équipe AtlasWay</p>
                            <p style={{ margin: 0, fontSize: 13, color: 'rgba(52,211,153,0.85)', lineHeight: 1.5 }}>{t.adminReply}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
