import { useState } from 'react';
import { Settings, X, Type, Contrast, Globe, Check } from 'lucide-react';
import { useLanguage, LANGS } from '../context/LanguageContext';

const FONT_SIZES = [
  { key: 'sm',   label: 'A',  title: 'Petite',  size: '14px' },
  { key: 'base', label: 'A',  title: 'Normale', size: '16px' },
  { key: 'lg',   label: 'A',  title: 'Grande',  size: '18px' },
];

function getStoredFontSize() { return localStorage.getItem('atlas_fontsize') || 'base'; }
function getStoredContrast() { return localStorage.getItem('atlas_contrast') === 'true'; }

export default function AccessibilityWidget() {
  const { lang, setLang } = useLanguage();
  const [open,       setOpen]       = useState(false);
  const [fontSize,   setFontSize]   = useState(getStoredFontSize);
  const [highContrast, setHighContrast] = useState(getStoredContrast);

  const applyFontSize = (key) => {
    const size = FONT_SIZES.find(f => f.key === key)?.size || '16px';
    document.documentElement.style.fontSize = size;
    localStorage.setItem('atlas_fontsize', key);
    setFontSize(key);
  };

  const toggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    localStorage.setItem('atlas_contrast', String(next));
    document.documentElement.classList.toggle('high-contrast', next);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Accessibilité & Langue"
        aria-label="Ouvrir les options d'accessibilité"
        className="fixed bottom-24 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{ background: 'var(--card-bg)', border: '1.5px solid var(--border-muted)', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', color: 'var(--text-secondary)' }}
      >
        <Settings size={18} />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-40 right-6 z-50 w-72 rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border-muted)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <span className="font-bold text-sm" style={{ color: 'var(--text-base)' }}>Accessibilité</span>
            <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }} className="hover:text-white transition">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-5">

            {/* Language */}
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Globe size={12} /> Langue / Language / اللغة
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.entries(LANGS).map(([key, val]) => (
                  <button
                    key={key}
                    onClick={() => setLang(key)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: lang === key ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)',
                      border: `1.5px solid ${lang === key ? '#C1272D' : 'var(--border-color)'}`,
                      color: lang === key ? '#C1272D' : 'var(--text-secondary)',
                    }}
                  >
                    <span>{val.flag}</span>
                    <span className="text-xs">{val.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font size */}
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Type size={12} /> Taille du texte
              </p>
              <div className="flex gap-2">
                {FONT_SIZES.map((f, i) => (
                  <button
                    key={f.key}
                    onClick={() => applyFontSize(f.key)}
                    title={f.title}
                    className="flex-1 py-2 rounded-xl font-bold transition-all"
                    style={{
                      fontSize: `${12 + i * 3}px`,
                      background: fontSize === f.key ? 'rgba(193,39,45,0.12)' : 'var(--bg-700)',
                      border: `1.5px solid ${fontSize === f.key ? '#C1272D' : 'var(--border-color)'}`,
                      color: fontSize === f.key ? '#C1272D' : 'var(--text-secondary)',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High contrast */}
            <div>
              <p className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Contrast size={12} /> Contraste élevé
              </p>
              <button
                onClick={toggleContrast}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all"
                style={{
                  background: highContrast ? 'rgba(255,255,255,0.1)' : 'var(--bg-700)',
                  border: `1.5px solid ${highContrast ? '#fff' : 'var(--border-color)'}`,
                }}
              >
                <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: highContrast ? '#fff' : 'var(--text-secondary)' }}>
                  {highContrast ? <><Check size={13} /> Activé</> : 'Désactivé'}
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${highContrast ? 'bg-white' : 'bg-dark-500'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${highContrast ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-white'}`} />
                </div>
              </button>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Paramètres sauvegardés automatiquement
            </p>
          </div>
        </div>
      )}
    </>
  );
}
