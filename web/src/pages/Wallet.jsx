import { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Spinner from '../components/Spinner';
import PaymentModal from '../components/PaymentModal';

const TYPE_META = {
  credit: { icon: ArrowDownLeft, color: '#10B981', label: 'Crédit', sign: '+' },
  debit:  { icon: ArrowUpRight,  color: '#EF4444', label: 'Débit',  sign: '-' },
};

function fmt(n) { return parseFloat(n || 0).toFixed(2); }

export default function WalletPage() {
  const [data,    setData]    = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [amount,      setAmount]      = useState('');
  const [topping,     setTopping]     = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/wallet').then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleTopUp = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val < 1) { toast.error('Montant invalide'); return; }
    setShowPayment(true);
  };

  const confirmTopUp = async () => {
    const val = parseFloat(amount);
    setTopping(true);
    try {
      const { data: d } = await api.post('/wallet/topup', { amount: val });
      toast.success(d.message || `+${val} DH ajoutés à votre portefeuille !`);
      setAmount('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setTopping(false); }
  };

  if (loading) return <Spinner size="lg" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-2xl font-black text-white">Mon portefeuille</h1>

      {/* Balance card */}
      <div className="rounded-2xl p-6 flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg,#C1272D,#8B1820)', boxShadow: '0 8px 32px rgba(193,39,45,0.3)' }}>
        <div>
          <p className="text-white/70 text-sm mb-1">Solde disponible</p>
          <p className="text-4xl font-black text-white">{fmt(data.balance)} <span className="text-xl font-semibold">DH</span></p>
        </div>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <Wallet size={28} className="text-white" />
        </div>
      </div>

      {/* Top-up form */}
      <div className="card">
        <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={16} className="text-green-400" /> Recharger</h2>
        <form onSubmit={handleTopUp} className="flex gap-3">
          <input
            type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="Montant en DH" min="1" max="5000" step="1"
            className="input flex-1" />
          <button type="submit" disabled={topping}
            className="btn-primary px-5 h-11 flex items-center gap-2 shrink-0">
            {topping ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            Recharger
          </button>
        </form>
        <div className="flex gap-2 mt-3">
          {[50, 100, 200, 500].map(v => (
            <button key={v} onClick={() => setAmount(String(v))}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
              +{v} DH
            </button>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="card">
        <h2 className="font-bold text-white mb-4">Historique des transactions</h2>
        {data.transactions.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">Aucune transaction pour l'instant</p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {data.transactions.map(tx => {
              const meta = TYPE_META[tx.type];
              const Icon = meta.icon;
              return (
                <div key={tx.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${meta.color}18` }}>
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.description}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm" style={{ color: meta.color }}>
                      {meta.sign}{fmt(tx.amount)} DH
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Solde: {fmt(tx.balanceAfter)} DH
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal
          amount={parseFloat(amount)}
          rideFrom="Recharge"
          rideTo="Portefeuille AtlasWay"
          onConfirm={confirmTopUp}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
