import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Users, Camera, ArrowRight, ArrowLeft, CheckCircle, MapPin, Shield, Star, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STEPS = { CHOICE: 'choice', DRIVER_INFO: 'driver_info', DRIVER_CAR: 'driver_car' };
const STEP_ORDER = [STEPS.CHOICE, STEPS.DRIVER_INFO, STEPS.DRIVER_CAR];

const CITIES = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda'];
const CITY_COLORS = ['#C1272D','#D4890A','#006233','#C1272D','#D4890A','#006233','#C1272D','#D4890A'];

function ZelligeStripe() {
  return (
    <div style={{ height: 5, display: 'flex', flexShrink: 0 }}>
      {Array.from({ length: 60 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: ['#C1272D','#D4890A','#006233'][i % 3] }} />
      ))}
    </div>
  );
}

function StepBar({ step, isDriver }) {
  const total   = isDriver ? 3 : 1;
  const current = isDriver ? STEP_ORDER.indexOf(step) : 0;
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 99, transition: 'all 0.3s',
          background: i <= current ? '#C1272D' : 'var(--bg-600)',
        }} />
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step,         setStep]         = useState(STEPS.CHOICE);
  const [choice,       setChoice]       = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [direction,    setDirection]    = useState('right');
  const [form,         setForm]         = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', licensePlate: '' });
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [carFile,      setCarFile]      = useState(null);
  const [carPreview,   setCarPreview]   = useState(null);

  const photoRef = useRef();
  const carRef   = useRef();

  const goTo = (next, dir = 'right') => { setDirection(dir); setStep(next); };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === 'photo') { setPhotoFile(file); setPhotoPreview(url); }
    else                  { setCarFile(file);   setCarPreview(url);   }
  };

  const handleSubmit = async () => {
    if (choice === 'driver') {
      if (!form.firstName.trim() || !form.lastName.trim()) { toast.error('Prénom et nom requis.'); return; }
      if (!form.licensePlate.trim()) { toast.error('Numéro de plaque requis.'); return; }
      if (!carFile) { toast.error('Photo de voiture requise.'); return; }
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('type', choice);
      fd.append('firstName', form.firstName);
      fd.append('lastName',  form.lastName);
      if (form.licensePlate) fd.append('licensePlate', form.licensePlate);
      if (photoFile) fd.append('photo', photoFile);
      if (carFile)   fd.append('carPhoto', carFile);
      const { data } = await api.put('/users/onboarding', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      toast.success(choice === 'driver' ? 'Bienvenue conducteur !' : 'Bienvenue sur AtlasWay !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-900)' }}>

      {/* ── Top bar ── */}
      <div>
        <ZelligeStripe />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(193,39,45,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Car size={18} style={{ color: '#C1272D' }} />
            </div>
            <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--text-primary)' }}>
              Atlas<span style={{ color: '#C1272D' }}>Way</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E80' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>Compte créé</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px 48px' }}>

        {/* ─── STEP 1: CHOICE ─── */}
        {step === STEPS.CHOICE && (
          <div style={{ width: '100%', maxWidth: 680, animation: `slide${direction === 'right' ? 'Right' : 'Left'} 0.3s ease-out` }}>
            <StepBar step={step} isDriver={choice === 'driver'} />

            {/* Titre */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C1272D' }}>✦ AtlasWay · Configuration</p>
              <h1 style={{ margin: '0 0 10px', fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Bienvenue, {user?.firstName || 'voyageur'} 👋
              </h1>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                AtlasWay connecte les voyageurs à travers tout le Maroc.<br />Comment souhaitez-vous utiliser la plateforme ?
              </p>
            </div>

            {/* Cities flow */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28, opacity: 0.65 }}>
              {CITIES.map((city, i) => (
                <span key={city} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: CITY_COLORS[i] }}>{city}</span>
                  {i < CITIES.length - 1 && <span style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 6px' }}>—</span>}
                </span>
              ))}
            </div>

            {/* Cartes de choix */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>

              {/* Passager */}
              <button onClick={() => setChoice('passenger')} style={{
                padding: '24px 20px', borderRadius: 18, border: '2px solid',
                borderColor: choice === 'passenger' ? '#C1272D' : 'var(--border-color)',
                background: choice === 'passenger' ? 'rgba(193,39,45,0.06)' : 'var(--card-bg)',
                transform: choice === 'passenger' ? 'translateY(-3px)' : 'none',
                boxShadow: choice === 'passenger' ? '0 10px 32px rgba(193,39,45,0.2)' : 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: choice === 'passenger' ? '#C1272D' : 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'all 0.2s' }}>
                  <Users size={22} style={{ color: '#fff' }} />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>Je suis voyageur</p>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Trouver des trajets, réserver et voyager à moindre coût.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Rechercher des trajets', 'Réserver en 1 clic', 'Chat avec le conducteur'].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <CheckCircle size={12} style={{ color: '#C1272D', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                {choice === 'passenger' && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#C1272D' }}>
                    <CheckCircle size={13} /> Sélectionné
                  </div>
                )}
              </button>

              {/* Conducteur */}
              <button onClick={() => setChoice('driver')} style={{
                padding: '24px 20px', borderRadius: 18, border: '2px solid',
                borderColor: choice === 'driver' ? '#006233' : 'var(--border-color)',
                background: choice === 'driver' ? 'rgba(0,98,51,0.06)' : 'var(--card-bg)',
                transform: choice === 'driver' ? 'translateY(-3px)' : 'none',
                boxShadow: choice === 'driver' ? '0 10px 32px rgba(0,98,51,0.2)' : 'none',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
              }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: choice === 'driver' ? '#006233' : 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'all 0.2s' }}>
                  <Car size={22} style={{ color: '#fff' }} />
                </div>
                <p style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>Je suis conducteur</p>
                <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Proposer mes trajets, transporter des passagers, couvrir mes frais.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Publier vos trajets', 'Choisir vos passagers', "Réduire vos coûts d'essence"].map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-muted)' }}>
                      <CheckCircle size={12} style={{ color: '#006233', flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                {choice === 'driver' && (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#006233' }}>
                    <CheckCircle size={13} /> Sélectionné
                  </div>
                )}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 28 }}>
              {[['12 000+', 'Voyageurs', '#C1272D'], ['48', 'Villes', '#D4890A'], ['4.8★', 'Note moy.', '#006233']].map(([val, label, color]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color }}>{val}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{label}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => {
                if (!choice) { toast.error('Choisissez un profil.'); return; }
                if (choice === 'passenger') handleSubmit();
                else goTo(STEPS.DRIVER_INFO, 'right');
              }} disabled={!choice || saving} style={{
                height: 52, padding: '0 40px', borderRadius: 14, border: 'none',
                background: !choice || saving ? 'var(--bg-700)' : choice === 'driver' ? 'linear-gradient(135deg,#006233,#004d26)' : 'linear-gradient(135deg,#C1272D,#9e1f24)',
                color: !choice || saving ? 'var(--text-muted)' : '#fff',
                fontSize: 15, fontWeight: 800, cursor: !choice || saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 9,
                boxShadow: choice && !saving ? `0 6px 20px ${choice === 'driver' ? 'rgba(0,98,51,0.35)' : 'rgba(193,39,45,0.35)'}` : 'none',
                transition: 'all 0.2s',
              }}>
                {saving ? 'Enregistrement…' : <>Continuer <ArrowRight size={17} /></>}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: DRIVER INFO ─── */}
        {step === STEPS.DRIVER_INFO && (
          <div style={{ width: '100%', maxWidth: 440, animation: `slide${direction === 'right' ? 'Right' : 'Left'} 0.3s ease-out` }}>
            <StepBar step={step} isDriver />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,98,51,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Shield size={24} style={{ color: '#006233' }} />
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#006233' }}>✦ Étape 2/3</p>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Votre profil conducteur</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Ces infos rassurent vos futurs passagers.</p>
            </div>

            <div style={{ borderRadius: 18, border: '1px solid var(--border-color)', background: 'var(--card-bg)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Photo de profil */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div onClick={() => photoRef.current.click()} style={{ position: 'relative', cursor: 'pointer' }}>
                  {photoPreview
                    ? <img src={photoPreview} alt="" style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid #006233' }} />
                    : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--bg-700)', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <Camera size={20} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>Photo</span>
                      </div>
                  }
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 28, height: 28, borderRadius: '50%', background: '#006233', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-900)' }}>
                    <Camera size={12} style={{ color: '#fff' }} />
                  </div>
                </div>
                <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'photo')} />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Photo de profil (optionnelle)</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Prénom</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="input" required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Nom</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="input" required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => goTo(STEPS.CHOICE, 'left')} style={{ flex: 1, height: 46, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <ArrowLeft size={15} /> Retour
                </button>
                <button onClick={() => {
                  if (!form.firstName.trim() || !form.lastName.trim()) { toast.error('Remplissez votre nom.'); return; }
                  goTo(STEPS.DRIVER_CAR, 'right');
                }} style={{ flex: 2, height: 46, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#006233,#004d26)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 4px 16px rgba(0,98,51,0.3)' }}>
                  Suivant <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: DRIVER CAR ─── */}
        {step === STEPS.DRIVER_CAR && (
          <div style={{ width: '100%', maxWidth: 440, animation: `slide${direction === 'right' ? 'Right' : 'Left'} 0.3s ease-out` }}>
            <StepBar step={step} isDriver />

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,98,51,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Car size={24} style={{ color: '#006233' }} />
              </div>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#006233' }}>✦ Étape 3/3</p>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>Votre véhicule</h2>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>Les passagers voient ces infos avant de réserver.</p>
            </div>

            <div style={{ borderRadius: 18, border: '1px solid var(--border-color)', background: 'var(--card-bg)', padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Photo voiture */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Photo du véhicule <span style={{ color: '#C1272D' }}>*</span>
                </label>
                <div onClick={() => carRef.current.click()} style={{
                  width: '100%', height: 160, borderRadius: 14, cursor: 'pointer', overflow: 'hidden',
                  border: `2px dashed ${carPreview ? '#006233' : 'var(--border-color)'}`,
                  background: 'var(--bg-700)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}>
                  {carPreview
                    ? <img src={carPreview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Camera size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>Cliquer pour ajouter une photo</p>
                        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG · max 3 Mo</p>
                      </>
                  }
                </div>
                <input ref={carRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileChange(e, 'car')} />
              </div>

              {/* Plaque */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                  Numéro de plaque <span style={{ color: '#C1272D' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    value={form.licensePlate}
                    onChange={e => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })}
                    placeholder="Ex : 12345-A-1"
                    className="input"
                    style={{ paddingLeft: 36, fontFamily: 'monospace', letterSpacing: '0.1em' }}
                    required
                  />
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-muted)' }}>Format marocain : 12345-A-1</p>
              </div>

              {/* Trust badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'rgba(0,98,51,0.06)', border: '1px solid rgba(0,98,51,0.15)' }}>
                <Shield size={16} style={{ color: '#006233', flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Vos informations sont <strong style={{ color: 'var(--text-secondary)' }}>vérifiées par notre équipe</strong> et ne sont partagées qu'avec vos passagers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => goTo(STEPS.DRIVER_INFO, 'left')} style={{ flex: 1, height: 46, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <ArrowLeft size={15} /> Retour
                </button>
                <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, height: 46, borderRadius: 12, border: 'none', background: saving ? 'var(--bg-700)' : 'linear-gradient(135deg,#006233,#004d26)', color: saving ? 'var(--text-muted)' : '#fff', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: saving ? 'none' : '0 4px 16px rgba(0,98,51,0.3)', transition: 'all 0.2s' }}>
                  {saving
                    ? <><span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Enregistrement…</>
                    : <><CheckCircle size={15} /> Terminer</>
                  }
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideRight { from { opacity: 0; transform: translateX(32px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft  { from { opacity: 0; transform: translateX(-32px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin       { to   { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
