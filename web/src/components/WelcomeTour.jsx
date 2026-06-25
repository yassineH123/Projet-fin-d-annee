import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Search, Car, MessageCircle, Shield, Star,
  ArrowRight, ArrowLeft, Sparkles, MapPin, Users, Banknote,
} from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    emoji: '🇲🇦',
    title: (name) => `Marhba bik, ${name} !`,
    subtitle: 'Bienvenue dans la communauté AtlasWay',
    description: 'Vous venez de rejoindre la première plateforme marocaine de covoiturage inter-villes. Laissez-nous vous guider en 4 étapes rapides.',
    highlight: null,
    color: '#C1272D',
    bg: 'linear-gradient(135deg, rgba(193,39,45,0.15), rgba(212,137,10,0.1))',
    stats: [
      { icon: Users, value: '10K+', label: 'Membres' },
      { icon: MapPin, value: '48', label: 'Villes' },
      { icon: Car, value: '500+', label: 'Trajets/jour' },
    ],
  },
  {
    id: 'search',
    emoji: '🔍',
    title: () => 'Trouvez votre trajet',
    subtitle: 'Recherche simple et rapide',
    description: 'Utilisez la barre de recherche en haut pour trouver un trajet. Entrez votre ville de départ, destination et date — les résultats apparaissent instantanément.',
    highlight: 'search',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.05))',
    tips: [
      '🗺️ 48 villes marocaines couvertes',
      '💰 Prix affichés clairement',
      '⭐ Conducteurs vérifiés et notés',
    ],
  },
  {
    id: 'booking',
    emoji: '🎟️',
    title: () => 'Réservez en 2 clics',
    subtitle: 'Paiement 100% sécurisé',
    description: 'Cliquez sur un trajet, choisissez vos places et payez en ligne par carte bancaire. Votre place est confirmée immédiatement.',
    highlight: null,
    color: '#22C55E',
    bg: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))',
    tips: [
      '💳 Paiement sécurisé via Stripe',
      '🔄 Annulation jusqu\'à 2h avant',
      '📩 Confirmation par email',
    ],
  },
  {
    id: 'driver',
    emoji: '🚗',
    title: () => 'Devenez conducteur',
    subtitle: 'Gagnez de l\'argent sur vos trajets',
    description: 'Vous faites régulièrement la route Casablanca-Rabat ? Proposez vos places vides et partagez les frais. Vérification d\'identité simple et rapide.',
    highlight: null,
    color: '#D4890A',
    bg: 'linear-gradient(135deg, rgba(212,137,10,0.12), rgba(212,137,10,0.05))',
    tips: [
      '💰 Jusqu\'à 1 500 DH/mois',
      '📋 Vérification CIN + permis',
      '⚡ Activation en 24-48h',
    ],
  },
  {
    id: 'atlasbot',
    emoji: '🤖',
    title: () => 'Rencontrez AtlasBot',
    subtitle: 'Votre assistant IA personnel',
    description: 'Vous avez une question ? AtlasBot répond en français et en darija 24h/24. Cliquez sur le bouton orange en bas à droite pour l\'essayer.',
    highlight: 'chatbot',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(139,92,246,0.05))',
    tips: [
      '🇲🇦 Répond en darija',
      '⚡ Réponse en moins de 2s',
      '💬 Disponible 24h/24',
    ],
  },
];

const STORAGE_KEY = 'atlasway_tour_done';

export default function WelcomeTour({ user, onDone }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setTimeout(() => setVisible(true), 800);
    }
  }, []);

  const close = (complete = false) => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
    if (onDone) onDone();
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else close(true);
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  if (!visible) return null;

  const current = TOUR_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === TOUR_STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top stripe */}
        <div style={{ height: 4, display: 'flex' }}>
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} style={{ flex: 1, background: ['#C1272D', '#D4890A', '#006233'][i % 3] }} />
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => close()}
          className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:opacity-70"
          style={{ background: 'var(--bg-700)', color: 'var(--text-muted)' }}
        >
          <X size={15} />
        </button>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pt-5 pb-2">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? 20 : 6,
                height: 6,
                background: i === step ? current.color : 'var(--bg-600)',
              }}
            />
          ))}
        </div>

        {/* Hero */}
        <div className="px-6 pt-4 pb-5 text-center" style={{ background: current.bg }}>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl"
            style={{ background: current.color + '20', border: `1px solid ${current.color}30` }}
          >
            {current.emoji}
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-base)' }}>
            {current.title(user?.firstName || 'ami')}
          </h2>
          <p className="text-sm font-medium mb-3" style={{ color: current.color }}>
            {current.subtitle}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {current.description}
          </p>
        </div>

        {/* Stats (welcome step) */}
        {current.stats && (
          <div className="flex divide-x px-6 py-4" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', divideColor: 'var(--border-color)' }}>
            {current.stats.map((s, i) => (
              <div key={i} className="flex-1 text-center px-2">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <s.icon size={13} style={{ color: current.color }} />
                  <span className="font-bold text-base" style={{ color: 'var(--text-base)' }}>{s.value}</span>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        {current.tips && (
          <div className="px-6 py-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
            {current.tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-base)' }}>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 px-6 pb-6 pt-4">
          {!isFirst && (
            <button
              onClick={prev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}
            >
              <ArrowLeft size={15} /> Retour
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)` }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {isLast ? (
              <>
                <Sparkles size={16} /> Commencer l'aventure !
              </>
            ) : (
              <>
                Suivant <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* Skip */}
        {!isLast && (
          <button
            onClick={() => close()}
            className="w-full pb-4 text-xs transition-all hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
          >
            Passer le guide
          </button>
        )}
      </div>
    </div>
  );
}
