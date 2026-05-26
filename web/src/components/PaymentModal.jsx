import { useState } from 'react';
import { CreditCard, Lock, CheckCircle, X } from 'lucide-react';

const METHODS = [
  { id: 'card',    label: 'Carte bancaire',    icon: '💳' },
  { id: 'cmi',     label: 'CMI / Paiement web', icon: '🏦' },
  { id: 'cash',    label: 'Cash (en main)',     icon: '💵' },
  { id: 'wallet',  label: 'Portefeuille AtlasWay', icon: '👛' },
];

export default function PaymentModal({ amount, rideFrom, rideTo, onConfirm, onClose }) {
  const [method,  setMethod]  = useState('card');
  const [step,    setStep]    = useState('choose'); // 'choose' | 'details' | 'success'
  const [form,    setForm]    = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (method === 'card' && (!form.number || !form.expiry || !form.cvv || !form.name)) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    setStep('success');
  };

  const fmt = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const fmtExp = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  if (step === 'success') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm card text-center py-10">
        <CheckCircle size={56} className="mx-auto mb-4 text-green-400" />
        <h2 className="text-xl font-black text-white mb-2">Paiement confirmé !</h2>
        <p className="text-slate-400 text-sm mb-1">{rideFrom} → {rideTo}</p>
        <p className="text-2xl font-black text-green-400 mb-6">{Number(amount).toFixed(0)} MAD</p>
        <button onClick={() => { onConfirm(); onClose(); }} className="btn-primary w-full">Voir ma réservation</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-green-400" />
            <span className="font-black text-white">Paiement sécurisé</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Montant */}
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)' }}>
            <p className="text-xs text-slate-400 mb-1">{rideFrom} → {rideTo}</p>
            <p className="text-3xl font-black text-white">{Number(amount).toFixed(0)} <span className="text-lg font-normal text-slate-400">MAD</span></p>
          </div>

          {/* Méthode */}
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(m => (
              <button key={m.id} onClick={() => setMethod(m.id)}
                className="flex items-center gap-2 p-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: method === m.id ? 'rgba(193,39,45,0.1)' : 'var(--bg-700)',
                  border: `1.5px solid ${method === m.id ? '#C1272D' : 'var(--border-color)'}`,
                  color: method === m.id ? '#C1272D' : 'var(--text-secondary)',
                }}>
                <span>{m.icon}</span> <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Carte fields */}
          {method === 'card' && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Numéro de carte</label>
                <div className="relative">
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={form.number} onChange={e => setForm(f => ({ ...f, number: fmt(e.target.value) }))}
                    className="input pl-8 text-sm tracking-widest" placeholder="1234 5678 9012 3456" maxLength={19} />
                </div>
              </div>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input text-sm" placeholder="Nom sur la carte" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: fmtExp(e.target.value) }))}
                  className="input text-sm" placeholder="MM/AA" maxLength={5} />
                <input value={form.cvv} onChange={e => setForm(f => ({ ...f, cvv: e.target.value.replace(/\D/,'').slice(0,3) }))}
                  className="input text-sm" placeholder="CVV" maxLength={3} type="password" />
              </div>
            </div>
          )}

          {method === 'cash' && (
            <div className="rounded-xl p-3 text-sm text-slate-400" style={{ background: 'var(--bg-700)' }}>
              💵 Vous paierez directement au conducteur lors du trajet.
            </div>
          )}
          {method === 'wallet' && (
            <div className="rounded-xl p-3 text-sm text-slate-400" style={{ background: 'var(--bg-700)' }}>
              👛 Votre solde portefeuille sera débité automatiquement.
            </div>
          )}
          {method === 'cmi' && (
            <div className="rounded-xl p-3 text-sm text-slate-400" style={{ background: 'var(--bg-700)' }}>
              🏦 Vous serez redirigé vers la page de paiement CMI sécurisée.
            </div>
          )}

          <button onClick={handlePay} disabled={loading} className="btn-primary w-full h-12 flex items-center justify-center gap-2">
            {loading
              ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Lock size={14} /> Payer {Number(amount).toFixed(0)} MAD</>
            }
          </button>
          <p className="text-xs text-center text-slate-500 flex items-center justify-center gap-1">
            <Lock size={10} /> Paiement crypté SSL — données non stockées
          </p>
        </div>
      </div>
    </div>
  );
}
