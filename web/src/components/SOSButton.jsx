import { useState } from 'react';
import { AlertTriangle, X, Phone, MapPin, Navigation, Share2 } from 'lucide-react';

const EMERGENCY = [
  { label: 'SAMU',        number: '15',  color: '#C1272D' },
  { label: 'Police',      number: '19',  color: '#3B82F6' },
  { label: 'Gendarmerie', number: '177', color: '#006233' },
  { label: 'Pompiers',    number: '15',  color: '#D4890A' },
];

export default function SOSButton() {
  const [open,       setOpen]       = useState(false);
  const [location,   setLocation]   = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [shared,     setShared]     = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocLoading(false); },
      ()  => setLocLoading(false),
      { timeout: 10000 }
    );
  };

  const shareLocation = async () => {
    if (!location) return;
    const url = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    if (navigator.share) {
      await navigator.share({ title: 'Ma position AtlasWay', text: 'Je partage ma position en cas d\'urgence.', url });
    } else {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="SOS — Urgence"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center font-black text-white text-sm transition-transform"
        style={{ background: 'linear-gradient(135deg,#C1272D,#9e1f24)', boxShadow: '0 4px 24px rgba(193,39,45,0.55)' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        SOS
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', boxShadow: '0 8px 48px rgba(0,0,0,0.35)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ background: 'rgba(193,39,45,0.1)', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} style={{ color: '#C1272D' }} />
                <span className="font-black text-white text-base">Numéros d'urgence</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-700)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X size={18} />
              </button>
            </div>

            {/* Grid of emergency numbers */}
            <div className="p-4 grid grid-cols-2 gap-3">
              {EMERGENCY.map(({ label, number, color }) => (
                <a key={label} href={`tel:${number}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
                  style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                  onMouseEnter={e => e.currentTarget.style.background = `${color}25`}
                  onMouseLeave={e => e.currentTarget.style.background = `${color}12`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: `${color}22` }}>
                    <Phone size={18} style={{ color }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-black text-white text-xl leading-none">{number}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Location sharing */}
            <div className="px-4 pb-5 flex flex-col gap-2">
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                <MapPin size={12} /> Partager ma position
              </p>
              {!location ? (
                <button onClick={getLocation} disabled={locLoading}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ background: 'rgba(193,39,45,0.1)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.3)' }}>
                  <Navigation size={15} className={locLoading ? 'animate-spin' : ''} />
                  {locLoading ? 'Localisation…' : 'Obtenir ma position'}
                </button>
              ) : (
                <button onClick={shareLocation}
                  className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Share2 size={15} />
                  {shared ? 'Lien copié !' : `Partager (${location.lat.toFixed(3)}, ${location.lng.toFixed(3)})`}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
