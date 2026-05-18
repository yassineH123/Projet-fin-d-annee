import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowRight, Shield, Star, Users, Zap, Car,
  CheckCircle, Clock, ChevronRight, ChevronDown, Smartphone,
  TrendingDown, Lock, ThumbsUp, MessageCircle, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── DATA ─────────────────────────────────────── */
const STATS = [
  { value: '12 000+', label: 'Voyageurs actifs',      icon: Users },
  { value: '45+',     label: 'Villes connectées',     icon: MapPin },
  { value: '4.8 / 5', label: 'Note moyenne',           icon: Star },
  { value: '60%',     label: 'Économies vs taxi',      icon: TrendingDown },
];

const STEPS = [
  { num: '01', icon: MapPin,      title: 'Recherchez',      desc: 'Entrez votre destination et la date. Des centaines de trajets disponibles partout au Maroc.' },
  { num: '02', icon: Users,       title: 'Choisissez',      desc: 'Comparez les conducteurs, leurs notes, leurs avis et leurs tarifs avant de réserver.' },
  { num: '03', icon: CheckCircle, title: 'Voyagez serein',  desc: 'Réservation confirmée en quelques secondes. Rencontrez votre conducteur et partez !' },
];

const TESTIMONIALS = [
  {
    name: 'Yasmine El Amrani', city: 'Casablanca', avatar: 'YE', color: 'bg-pink-500',
    rating: 5,
    text: "J'utilise AtlasWay chaque semaine pour aller à Rabat. J'économise presque 80 DH par trajet comparé au CTM. Les conducteurs sont super sympas et ponctuels.",
    detail: 'Utilise AtlasWay depuis 6 mois',
  },
  {
    name: 'Karim Benali', city: 'Marrakech', avatar: 'KB', color: 'bg-blue-500',
    rating: 5,
    text: "En tant que conducteur, j'ai remboursé mon carburant depuis le premier mois. La plateforme est simple, les passagers sont respectueux et le paiement est clair.",
    detail: 'Conducteur — 43 trajets effectués',
  },
  {
    name: 'Nadia Cherkaoui', city: 'Fès', avatar: 'NC', color: 'bg-green-500',
    rating: 5,
    text: "J'étais sceptique au début mais l'inscription est rapide et les profils sont vérifiés. J'ai fait Fès–Casablanca pour 80 DH au lieu de 150 DH en train. Incroyable !",
    detail: 'Membre depuis 3 mois',
  },
];

const SAVINGS = [
  { mode: 'Taxi',           price: '400–600 DH', icon: '🚕', bad: true },
  { mode: 'CTM / Supratours', price: '120–180 DH', icon: '🚌', bad: true },
  { mode: 'AtlasWay',       price: '60–100 DH',  icon: '🚗', bad: false, highlight: true },
];

const FAQS = [
  { q: "C'est gratuit de s'inscrire ?",                   a: "Oui, l'inscription et la recherche de trajets sont totalement gratuites. Vous payez uniquement la participation aux frais directement au conducteur." },
  { q: 'Comment sont vérifiés les conducteurs ?',          a: 'Chaque conducteur doit confirmer son adresse email. Les passagers peuvent ensuite laisser des avis après chaque trajet, garantissant une communauté fiable.' },
  { q: 'Que se passe-t-il si le conducteur annule ?',      a: "Vous recevez une notification immédiate et pouvez rechercher un autre trajet. Nous vous recommandons de réserver quelques jours à l'avance." },
  { q: 'Comment contacter mon conducteur / passager ?',    a: 'Une messagerie intégrée est disponible directement sur la plateforme dès que votre réservation est confirmée.' },
  { q: 'Puis-je proposer mon propre trajet ?',             a: 'Absolument ! Tout utilisateur peut publier un trajet. Indiquez votre itinéraire, le prix par place et le nombre de places disponibles.' },
];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Tétouan', 'Laâyoune'];

const TRUST = [
  { icon: Shield,       title: 'Profils vérifiés',    desc: 'Email confirmé pour chaque compte.' },
  { icon: Lock,         title: 'Données sécurisées',  desc: 'Vos informations sont protégées.' },
  { icon: ThumbsUp,     title: 'Avis authentiques',   desc: 'Notations réelles après chaque trajet.' },
  { icon: MessageCircle,title: 'Support réactif',     desc: 'Équipe disponible 7j/7 par message.' },
];

/* ─── COMPONENTS ────────────────────────────────── */
function Stars({ n = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
      ))}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-dark-500 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-dark-700 transition-colors"
      >
        <span className="text-white font-semibold text-sm">{q}</span>
        <ChevronDown size={18} className={`text-slate-400 transition-transform flex-shrink-0 ml-3 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-dark-500 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── PAGE ──────────────────────────────────────── */
export default function Home() {
  const navigate    = useNavigate();
  const { user }    = useAuth();
  const [from, setFrom] = useState('');
  const [to,   setTo]   = useState('');
  const [date, setDate] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    if (date) p.set('date', date);
    navigate(`/rides/search?${p.toString()}`);
  };

  return (
    <div className="overflow-x-hidden">

      {/* ── ANNOUNCEMENT BAR ── */}
      <div className="bg-primary-600 text-white text-center py-2 px-4 text-sm font-medium">
        🎉 AtlasWay est 100% gratuit — Inscrivez-vous maintenant et économisez sur vos trajets !
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 bg-dark-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* social proof badge */}
          <div className="inline-flex items-center gap-2 bg-dark-700 border border-dark-500 text-slate-300 text-xs font-semibold px-4 py-2 rounded-full mb-6">
            <div className="flex -space-x-1.5">
              {['bg-pink-500','bg-blue-500','bg-green-500'].map((c,i) => (
                <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-dark-700`} />
              ))}
            </div>
            <span>+12 000 voyageurs nous font confiance</span>
            <Stars n={5} />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.06] mb-5 tracking-tight">
            Voyagez partout<br />
            au Maroc pour{' '}
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              moins cher.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
            Covoiturage simple, économique et sécurisé entre particuliers.
            Économisez jusqu'à <strong className="text-white">60%</strong> sur vos trajets.
          </p>

          {/* micro trust */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs mb-10">
            {['✅ Inscription gratuite', '✅ Sans engagement', '✅ Profils vérifiés', '✅ Avis authentiques'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>

          {/* CTA */}
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 py-4 px-8 text-base rounded-2xl shadow-xl shadow-primary-500/20">
                Créer mon compte gratuitement <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="flex items-center justify-center gap-2 py-4 px-8 text-base rounded-2xl border border-dark-500 bg-dark-800 text-slate-200 font-semibold hover:border-primary-500/50 transition-all">
                Se connecter
              </Link>
            </div>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="bg-dark-800/90 backdrop-blur border border-dark-500 rounded-2xl p-4 shadow-2xl max-w-3xl mx-auto">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest text-left mb-3">Trouver un trajet maintenant</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={15} />
                <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Départ" className="input pl-9 text-sm" list="from-list" />
                <datalist id="from-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400" size={15} />
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="Arrivée" className="input pl-9 text-sm" list="to-list" />
                <datalist id="to-list">{CITIES.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input text-sm text-slate-400" />
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-12 rounded-xl">
                Rechercher <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-dark-800 border-y border-dark-500">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-dark-500 divide-y md:divide-y-0">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center py-10 px-6">
              <div className="flex items-center justify-center mb-2">
                <Icon size={18} className="text-primary-400 mr-2" />
                <p className="text-3xl font-black text-white">{value}</p>
              </div>
              <p className="text-slate-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-28 px-4 bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Simple & rapide</p>
            <h2 className="text-4xl font-black text-white mb-3">3 étapes pour partir</h2>
            <p className="text-slate-400 max-w-lg mx-auto">Réservez votre prochain trajet en moins de 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ num, icon: Icon, title, desc }, i) => (
              <div key={num} className="relative">
                <div className="card p-7 hover:border-primary-500/30 transition-all duration-300 h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-6xl font-black text-dark-600 leading-none">{num}</span>
                    <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="text-primary-400" size={22} />
                    </div>
                  </div>
                  <h3 className="text-white font-black text-xl mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
                {i < 2 && <ChevronRight className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 text-dark-500 z-10" size={20} />}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/rides/search" className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl">
              Voir les trajets disponibles <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── SAVINGS COMPARISON ── */}
      <section className="py-24 px-4 bg-dark-800/50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Comparez et économisez</p>
          <h2 className="text-4xl font-black text-white mb-3">Casablanca → Marrakech</h2>
          <p className="text-slate-400 mb-12">Exemple de prix pour un passager sur cette route populaire</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch">
            {SAVINGS.map(({ mode, price, icon, bad, highlight }) => (
              <div key={mode} className={`flex-1 rounded-2xl p-6 border transition-all ${
                highlight
                  ? 'bg-primary-600/10 border-primary-500/50 scale-105 shadow-xl shadow-primary-500/10'
                  : 'bg-dark-800 border-dark-500 opacity-70'
              }`}>
                {highlight && (
                  <div className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-3">
                    ⭐ Meilleur choix
                  </div>
                )}
                <div className="text-4xl mb-3">{icon}</div>
                <p className="text-white font-bold text-lg mb-1">{mode}</p>
                <p className={`text-2xl font-black ${highlight ? 'text-primary-400' : 'text-slate-400 line-through'}`}>
                  {price}
                </p>
                {highlight && <p className="text-green-400 text-xs font-semibold mt-2">Économie jusqu'à 60%</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-28 px-4 bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Ils nous font confiance</p>
            <h2 className="text-4xl font-black text-white mb-3">Ce que disent nos voyageurs</h2>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
              <Stars n={5} /> <span className="font-semibold text-white ml-1">4.8/5</span> basé sur des avis réels
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, avatar, color, rating, text, detail }) => (
              <div key={name} className="card p-6 flex flex-col gap-4 hover:border-primary-500/20 transition-all duration-300">
                <Stars n={rating} />
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-dark-500">
                  <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-black text-sm flex-shrink-0`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{name}</p>
                    <p className="text-slate-500 text-xs">{city} · {detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR ROUTES ── */}
      <section className="py-20 px-4 bg-dark-800/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Populaires</p>
            <h2 className="text-4xl font-black text-white mb-3">Trajets les plus demandés</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              ['Casablanca','Marrakech','À partir de 70 DH'],
              ['Rabat','Casablanca','À partir de 30 DH'],
              ['Fès','Rabat','À partir de 60 DH'],
              ['Tanger','Casablanca','À partir de 80 DH'],
              ['Agadir','Marrakech','À partir de 50 DH'],
              ['Meknès','Fès','À partir de 20 DH'],
              ['Casablanca','Tanger','À partir de 90 DH'],
              ['Oujda','Fès','À partir de 70 DH'],
            ].map(([a, b, price]) => (
              <button
                key={`${a}-${b}`}
                onClick={() => navigate(`/rides/search?from=${a}&to=${b}`)}
                className="card flex flex-col gap-1 p-4 hover:border-primary-500/40 hover:bg-dark-700 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm font-bold">{a}</p>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-primary-400 transition-colors" />
                </div>
                <p className="text-primary-400 text-xs flex items-center gap-1">
                  <ArrowRight size={10} /> {b}
                </p>
                <p className="text-slate-500 text-xs mt-1">{price}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST & SAFETY ── */}
      <section className="py-24 px-4 bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Sécurité & confiance</p>
              <h2 className="text-4xl font-black text-white mb-4">Votre sécurité,<br />notre priorité</h2>
              <p className="text-slate-400 leading-relaxed mb-8">
                Chez AtlasWay, chaque détail est pensé pour vous offrir une expérience sûre et fiable.
                Nous vérifions les comptes, sécurisons vos données et encourageons les avis honnêtes.
              </p>
              <div className="flex flex-col gap-3">
                {['Email de confirmation obligatoire', 'Système de notation bidirectionnel', 'Messagerie intégrée et sécurisée', 'Signalement simple en cas de problème'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-slate-300 text-sm">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TRUST.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card p-5 hover:border-primary-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-primary-400" />
                  </div>
                  <p className="text-white font-bold text-sm mb-1">{title}</p>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOR DRIVERS ── */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary-600/15 via-dark-800 to-dark-800 border-y border-dark-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
            <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Pour les conducteurs</p>
            <h2 className="text-3xl font-black text-white mb-4">Réduisez vos frais de carburant</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Publiez votre trajet en 2 minutes, partagez les frais avec vos passagers et faites des rencontres enrichissantes.
              Certains conducteurs économisent plus de <strong className="text-white">500 DH par mois</strong>.
            </p>
            <div className="flex flex-col gap-2">
              {['Publiez gratuitement, sans commission', 'Choisissez vos passagers', 'Définissez votre propre prix'].map(p => (
                <div key={p} className="flex items-center gap-2 text-slate-300 text-sm">
                  <Zap size={14} className="text-yellow-400" /> {p}
                </div>
              ))}
            </div>
          </div>
          <Link to="/rides/publish" className="btn-primary flex items-center gap-2 py-4 px-8 rounded-2xl text-base flex-shrink-0 shadow-lg shadow-primary-500/20">
            <Car size={20} /> Publier mon trajet
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-28 px-4 bg-dark-900">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-400 text-xs font-bold tracking-widest uppercase mb-3">Questions fréquentes</p>
            <h2 className="text-4xl font-black text-white mb-3">Vous avez des questions ?</h2>
            <p className="text-slate-400">Tout ce que vous devez savoir avant de commencer</p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(faq => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── MOBILE APP ── */}
      <section className="py-16 px-4 bg-dark-800 border-y border-dark-500">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="text-primary-400" size={28} />
            </div>
            <div>
              <h3 className="text-white font-black text-xl mb-1">Application mobile — Bientôt</h3>
              <p className="text-slate-400 text-sm">Réservez depuis votre téléphone, recevez vos confirmations instantanément.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-5 py-3 bg-dark-700 border border-dark-500 rounded-xl">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <p className="text-slate-500 text-xs">Bientôt sur</p>
                <p className="text-white text-sm font-bold">App Store</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-dark-700 border border-dark-500 rounded-xl">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="text-slate-500 text-xs">Bientôt sur</p>
                <p className="text-white text-sm font-bold">Google Play</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-28 px-4 bg-dark-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-600/5 to-transparent pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full mb-6">
            <Award size={12} /> Rejoignez la communauté
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Prêt à voyager<br />
            <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
              autrement ?
            </span>
          </h2>
          <p className="text-slate-400 mb-3 text-lg">
            Inscription gratuite · Sans engagement · 12 000+ voyageurs satisfaits
          </p>
          <p className="text-slate-500 text-sm mb-10">
            Rejoignez AtlasWay aujourd'hui et économisez dès votre premier trajet.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary flex items-center justify-center gap-2 py-4 px-10 text-base rounded-2xl shadow-xl shadow-primary-500/20">
                Créer mon compte — C'est gratuit <ArrowRight size={18} />
              </Link>
              <Link to="/rides/search" className="flex items-center justify-center gap-2 py-4 px-10 text-base rounded-2xl border border-dark-500 bg-dark-800 text-slate-200 font-semibold hover:border-primary-500/50 transition-all">
                Voir les trajets
              </Link>
            </div>
          ) : (
            <Link to="/rides/search" className="btn-primary inline-flex items-center gap-2 py-4 px-10 text-base rounded-2xl">
              Voir les trajets disponibles <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-dark-800 border-t border-dark-500 pt-12 pb-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Car className="text-primary-400" size={22} />
                <span className="text-white font-black text-xl">Atlas<span className="text-primary-400">Way</span></span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                La plateforme de covoiturage de confiance pour voyager au Maroc.
              </p>
            </div>
            {/* Voyageurs */}
            <div>
              <p className="text-white font-bold text-sm mb-4">Voyageurs</p>
              <div className="flex flex-col gap-2 text-slate-400 text-sm">
                <Link to="/rides/search" className="hover:text-white transition-colors">Rechercher un trajet</Link>
                <Link to="/rides/publish" className="hover:text-white transition-colors">Publier un trajet</Link>
                <Link to="/bookings" className="hover:text-white transition-colors">Mes réservations</Link>
              </div>
            </div>
            {/* Compte */}
            <div>
              <p className="text-white font-bold text-sm mb-4">Compte</p>
              <div className="flex flex-col gap-2 text-slate-400 text-sm">
                <Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link>
                <Link to="/login" className="hover:text-white transition-colors">Se connecter</Link>
                <Link to="/profile" className="hover:text-white transition-colors">Mon profil</Link>
              </div>
            </div>
            {/* Contact */}
            <div>
              <p className="text-white font-bold text-sm mb-4">Contact</p>
              <div className="flex flex-col gap-2 text-slate-400 text-sm">
                <a href="mailto:atlaswaymaroc@gmail.com" className="hover:text-white transition-colors">atlaswaymaroc@gmail.com</a>
                <span>Maroc 🇲🇦</span>
              </div>
            </div>
          </div>
          <div className="border-t border-dark-500 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-500 text-xs">
            <p>© 2025 AtlasWay · Tous droits réservés</p>
            <p>Fait avec ❤️ au Maroc</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
