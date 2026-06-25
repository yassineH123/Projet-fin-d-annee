import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw, TrendingUp, Shield, Zap, CreditCard, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { useTheme } from '../context/ThemeContext';

const TYPE_META = {
  credit: { icon: ArrowDownLeft, color: '#10B981', bg: 'rgba(16,185,129,0.1)', label: 'Reçu',   sign: '+' },
  debit:  { icon: ArrowUpRight,  color: '#F87171', bg: 'rgba(248,113,113,0.1)', label: 'Dépensé', sign: '-' },
};

function fmt(n) { return parseFloat(n || 0).toFixed(2); }

function ZelligeStripe() {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 4, display: 'flex', overflow: 'hidden', borderRadius: '16px 16px 0 0' }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3] }} />
      ))}
    </div>
  );
}

const QUICK_AMOUNTS = [50, 100, 200, 500];

export default function WalletPage() {
  const { theme } = useTheme();
  const isLight   = theme === 'light';

  const [data,    setData]    = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [amount,  setAmount]  = useState('');
  const [topping, setTopping] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/wallet').then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      toast.success('Recharge confirmée ! Votre solde a été mis à jour.');
      window.history.replaceState({}, '', '/wallet');
      load();
    } else if (params.get('payment') === 'cancelled') {
      toast.error('Paiement annulé.');
      window.history.replaceState({}, '', '/wallet');
    }
  }, []);

  const handleTopUp = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val < 10) { toast.error('Montant minimum : 10 DH'); return; }
    setTopping(true);
    try {
      const { data: d } = await api.post('/wallet/stripe/checkout', { amount: val });
      if (d.url) {
        window.location.href = d.url;
      } else {
        toast.success(d.message || `+${val} DH ajoutés !`);
        setAmount('');
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setTopping(false); }
  };

  if (loading) return <Spinner size="lg" />;

  const credits = data.transactions.filter(t => t.type === 'credit').reduce((s, t) => s + parseFloat(t.amount || 0), 0);
  const debits  = data.transactions.filter(t => t.type === 'debit' ).reduce((s, t) => s + parseFloat(t.amount || 0), 0);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px 64px' }}>

      {/* ── Titre ── */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4890A' }}>✦ AtlasWay</p>
        <h1 style={{ margin: '2px 0 0', fontSize: 26, fontWeight: 900, color: 'var(--text-primary)' }}>Mon portefeuille</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)' }}>Gérez votre solde et vos transactions</p>
      </div>

      {/* ── Balance card ── */}
      <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, position: 'relative', boxShadow: '0 16px 48px rgba(193,39,45,0.25)' }}>
        <ZelligeStripe />
        <div style={{
          background: isLight
            ? 'linear-gradient(135deg, #C1272D 0%, #9e1f24 50%, #7e181d 100%)'
            : 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 50%, #1f0d0d 100%)',
          padding: '28px 28px 24px', position: 'relative', overflow: 'hidden',
        }}>
          {/* Motif géométrique de fond */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', width: 80, height: 80, border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, transform: `rotate(${i * 15}deg)`,
              top: `${-20 + i * 10}px`, right: `${20 + i * 12}px`,
            }} />
          ))}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>Solde disponible</p>
              <p style={{ margin: '6px 0 0', fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>
                {fmt(data.balance)}
                <span style={{ fontSize: 18, fontWeight: 600, marginLeft: 6, color: 'rgba(255,255,255,0.75)' }}>DH</span>
              </p>
            </div>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.18)' }}>
              <Wallet size={24} style={{ color: '#FFD980' }} />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: 0, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 0', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Reçu au total</p>
              <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, color: '#6EE7B7' }}>+{fmt(credits)} DH</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
              <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>Dépensé au total</p>
              <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 900, color: '#FCA5A5' }}>{fmt(debits)} DH</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Badges sécurité ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { icon: Shield, label: 'Paiements sécurisés', color: '#10B981' },
          { icon: Zap,    label: 'Instantané',           color: '#F59E0B' },
          { icon: TrendingUp, label: 'Suivi en temps réel', color: '#3B82F6' },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} style={{ flex: 1, padding: '8px 10px', borderRadius: 10, background: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={12} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', lineHeight: 1.2 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Recharger ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 16, background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '20px 22px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <CreditCard size={15} style={{ color: '#D4890A' }} /> Recharger le portefeuille
          </p>

          {/* Montants rapides */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
            {QUICK_AMOUNTS.map(v => (
              <button key={v} onClick={() => setAmount(String(v))} style={{
                padding: '10px 4px', borderRadius: 10, fontSize: 13, fontWeight: 800,
                cursor: 'pointer', border: '1px solid',
                borderColor: amount === String(v) ? '#D4890A' : 'var(--border-color)',
                background: amount === String(v) ? 'rgba(212,137,10,0.1)' : 'var(--bg-700)',
                color: amount === String(v) ? '#D4890A' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>+{v} DH</button>
            ))}
          </div>

          <form onSubmit={handleTopUp} style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="Montant personnalisé (DH)" min="10" max="5000" step="1"
                className="input" style={{ width: '100%', paddingRight: 50 }} />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>DH</span>
            </div>
            <button type="submit" disabled={topping} style={{
              padding: '0 20px', height: 44, borderRadius: 12, border: 'none', flexShrink: 0,
              background: topping ? 'var(--bg-700)' : 'linear-gradient(135deg, #D4890A, #b8720a)',
              color: topping ? 'var(--text-muted)' : '#fff', fontWeight: 800, fontSize: 13,
              cursor: topping ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              boxShadow: topping ? 'none' : '0 4px 14px rgba(212,137,10,0.3)',
              transition: 'all 0.15s',
            }}>
              {topping ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
              Recharger
            </button>
          </form>
        </div>
      </div>

      {/* ── Historique ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />
        <div style={{ padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
              Historique des transactions
            </p>
            {data.transactions.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-700)', padding: '3px 8px', borderRadius: 6 }}>
                {data.transactions.length} opération{data.transactions.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {data.transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>💸</p>
              <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Aucune transaction</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Rechargez votre portefeuille pour commencer</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.transactions.map((tx, i) => {
                const meta = TYPE_META[tx.type] || TYPE_META.debit;
                const Icon = meta.icon;
                return (
                  <div key={tx.id || i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: 'var(--bg-700)', border: '1px solid var(--border-color)',
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={17} style={{ color: meta.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {tx.description}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: 900, color: meta.color }}>
                        {meta.sign}{fmt(tx.amount)} DH
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-muted)' }}>
                        Solde : {fmt(tx.balanceAfter)} DH
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
