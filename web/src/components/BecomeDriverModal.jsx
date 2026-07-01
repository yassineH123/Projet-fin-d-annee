import { useNavigate } from 'react-router-dom';
import { X, Car, Shield, Star, Banknote, CheckCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';

const STEPS = [
  { icon: CheckCircle, label: 'Compte créé', done: true },
  { icon: Shield, label: 'Vérification identité (CIN + permis)', done: false },
  { icon: Car, label: 'Statut conducteur activé', done: false },
];

const BENEFITS = [
  { icon: Banknote, color: '#22C55E', title: 'Gagnez de l\'argent', desc: 'Jusqu\'à 1 500 DH/mois en partageant vos trajets' },
  { icon: Star, color: '#D4890A', title: 'Communauté de confiance', desc: 'Système de notation et vérification d\'identité' },
  { icon: Car, color: '#3B82F6', title: 'Flexibilité totale', desc: 'Publiez vos trajets quand vous voulez' },
  { icon: Shield, color: '#8B5CF6', title: 'Assurance incluse', desc: 'Couverture pour tous vos passagers' },
];

export default function BecomeDriverModal({ onClose, isVerificationPending }) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--bg-700)', color: 'var(--text-muted)' }}
        >
          <X size={16} />
        </button>

        {/* Hero */}
        <div className="relative px-6 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(193,39,45,0.15), rgba(212,137,10,0.1))' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #C1272D, #D4890A)' }}>
            <Car size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-base)' }}>
            Devenez Conducteur AtlasWay
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Partagez vos trajets et gagnez de l'argent
          </p>
        </div>

        <div className="px-6 pb-6">
          {/* Pending state */}
          {isVerificationPending ? (
            <div className="my-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(212,137,10,0.1)', border: '1px solid rgba(212,137,10,0.3)' }}>
              <Clock size={18} style={{ color: '#D4890A', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#D4890A' }}>Vérification en cours</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Votre dossier est en cours d'examen par notre équipe. Délai : 24-48h ouvrées.
                </p>
              </div>
            </div>
          ) : (
            <div className="my-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(193,39,45,0.08)', border: '1px solid rgba(193,39,45,0.2)' }}>
              <AlertCircle size={18} style={{ color: '#C1272D', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-bold text-sm" style={{ color: '#C1272D' }}>Statut conducteur requis</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Pour publier un trajet, vous devez d'abord faire vérifier votre identité.
                </p>
              </div>
            </div>
          )}

          {/* Steps */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Étapes pour devenir conducteur
            </p>
            <div className="flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: step.done ? 'rgba(34,197,94,0.08)' : 'var(--bg-700)', border: `1px solid ${step.done ? 'rgba(34,197,94,0.2)' : 'var(--border-color)'}` }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: step.done ? 'rgba(34,197,94,0.2)' : 'var(--bg-500)' }}>
                    {step.done
                      ? <CheckCircle size={14} style={{ color: '#22C55E' }} />
                      : <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                    }
                  </div>
                  <p className="text-sm font-medium" style={{ color: step.done ? '#22C55E' : 'var(--text-base)' }}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Pourquoi devenir conducteur ?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {BENEFITS.map((b, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: b.color + '20' }}>
                    <b.icon size={14} style={{ color: b.color }} />
                  </div>
                  <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--text-base)' }}>{b.title}</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          {!isVerificationPending ? (
            <button
              onClick={() => { onClose(); navigate('/profile'); }}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, #C1272D, #D4890A)' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Commencer la vérification <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl font-bold transition-all"
              style={{ background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
            >
              Fermer — Je patiente
            </button>
          )}

          <p className="text-center text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Vérification gratuite · Résultat en 24-48h
          </p>
        </div>
      </div>
    </div>
  );
}
