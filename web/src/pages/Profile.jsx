import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Camera, Save, Lock, MapPin, Clock, Star, ChevronRight,
  Car, FileText, Shield, ShieldCheck, Accessibility,
  Music, Cigarette, PawPrint, MessageCircle, Upload, CheckCircle, AlertCircle, MessageSquare, Flag, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import FriendButton from '../components/FriendButton';
import ReliabilityScore from '../components/ReliabilityScore';

const LANGUAGES = ['Français', 'Arabe', 'Darija', 'Amazigh', 'Anglais', 'Espagnol'];

/* ── Zellige stripe ── */
function ZelligeStripe({ radius = '14px 14px 0 0' }) {
  const colors = ['#C1272D', '#D4890A', '#006233'];
  return (
    <div style={{ height: 5, display: 'flex', overflow: 'hidden', borderRadius: radius }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ flex: 1, background: colors[i % 3], opacity: 0.88 }} />
      ))}
    </div>
  );
}

/* ── Section card ── */
function SectionCard({ title, icon: Icon, accent = '#C1272D', children, action }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
      <div style={{ height: 3, background: accent }} />
      <div style={{ padding: '16px 18px' }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.07em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              {Icon && <Icon size={13} style={{ color: accent }} />}{title}
            </p>
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ── Toggle switch ── */
function Toggle({ checked, onChange, color = '#C1272D' }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 21, borderRadius: 10.5, flexShrink: 0, cursor: 'pointer', border: 'none',
        background: checked ? color : 'var(--bg-500)', position: 'relative', transition: 'background .2s',
      }}>
      <span style={{
        position: 'absolute', top: 2.5, left: checked ? 19 : 2.5, width: 16, height: 16,
        borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

/* ── Star display ── */
function StarDisplay({ rating, count }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13} style={{ color: s <= Math.round(rating) ? '#F59E0B' : 'var(--border-color)', fill: s <= Math.round(rating) ? '#F59E0B' : 'none' }} />
      ))}
      {count > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>({count} avis)</span>}
    </div>
  );
}

/* ── Doc upload field ── */
function DocUploadField({ label, fieldName, currentDoc, onChange, required }) {
  const ref = useRef();
  const [preview, setPreview] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith('image/')) setPreview(URL.createObjectURL(file));
    else setPreview('pdf');
    onChange(fieldName, file);
  };

  const hasDoc = preview || currentDoc;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#F87171' }}>*</span>}
      </label>
      <div onClick={() => ref.current.click()} style={{
        border: `2px dashed ${hasDoc ? '#22C55E' : 'var(--border-color)'}`,
        borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', gap: 10,
        cursor: 'pointer', background: hasDoc ? 'rgba(34,197,94,0.05)' : 'var(--bg-700)',
        transition: 'border-color .2s',
      }}>
        {hasDoc ? (
          preview === 'pdf' || (currentDoc && currentDoc.endsWith('.pdf')) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E' }}>
              <FileText size={18} /><span style={{ fontSize: 13, fontWeight: 600 }}>Document chargé</span><CheckCircle size={15} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src={preview || currentDoc} alt="" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8 }} />
              <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle size={13} /> Chargé</span>
            </div>
          )
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)' }}>
            <Upload size={16} /><span style={{ fontSize: 13 }}>Cliquer pour uploader (image ou PDF)</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleChange} />
      </div>
    </div>
  );
}

const LEVELS = [
  { name: 'Bronze',  emoji: '🥉', color: '#CD7F32', bg: 'rgba(205,127,50,0.10)',  min: 0,   max: 9   },
  { name: 'Argent',  emoji: '🥈', color: '#A0A0A0', bg: 'rgba(160,160,160,0.10)', min: 10,  max: 24  },
  { name: 'Or',      emoji: '🥇', color: '#FFD700', bg: 'rgba(255,215,0,0.10)',   min: 25,  max: 49  },
  { name: 'Platine', emoji: '💎', color: '#B0C4DE', bg: 'rgba(176,196,222,0.10)', min: 50,  max: 99  },
  { name: 'Diamant', emoji: '🔷', color: '#89CFF0', bg: 'rgba(137,207,240,0.10)', min: 100, max: Infinity },
];

function LevelCard({ trips, rating }) {
  const lvl    = LEVELS.find(l => trips >= l.min && trips <= l.max) || LEVELS[0];
  const next   = LEVELS[LEVELS.indexOf(lvl) + 1];
  const pct    = next ? Math.min(100, Math.round(((trips - lvl.min) / (next.min - lvl.min)) * 100)) : 100;
  const perks  = [
    { label: 'Priorité recherche', ok: trips >= 25 },
    { label: 'Badge profil',       ok: trips >= 10 },
    { label: 'Support prioritaire',ok: trips >= 50 },
    { label: 'Commission réduite', ok: trips >= 100 },
  ];
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: `1px solid ${lvl.color}30` }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${lvl.color}, ${next?.color || lvl.color})` }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: lvl.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>{lvl.emoji}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: lvl.color }}>Niveau AtlasWay</p>
            <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 900, color: 'var(--text-primary)' }}>{lvl.name}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
              {next ? `${trips - lvl.min} / ${next.min - lvl.min} trajets → ${next.emoji} ${next.name}` : '🏆 Niveau maximum atteint !'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: lvl.color }}>{trips}</p>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>trajets</p>
          </div>
        </div>

        {/* Progress bar */}
        {next && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: lvl.color }}>{lvl.emoji} {lvl.name}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>{next.emoji} {next.name} ({pct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-700)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, width: `${pct}%`, background: `linear-gradient(90deg, ${lvl.color}, ${next.color})`, transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
            </div>
          </div>
        )}

        {/* Perks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {perks.map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', borderRadius: 10, background: p.ok ? `${lvl.color}10` : 'var(--bg-700)', border: `1px solid ${p.ok ? lvl.color + '30' : 'var(--border-color)'}` }}>
              <span style={{ fontSize: 13 }}>{p.ok ? '✅' : '🔒'}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.ok ? lvl.color : 'var(--text-muted)' }}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const isMe = !id || id === me?.id;
  const photoRef = useRef();

  const [profile,  setProfile]  = useState(null);
  const [rides,    setRides]    = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [respondingId, setRespondingId] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [docFiles, setDocFiles] = useState({});

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', bio: '',
    carModel: '', carColor: '', carYear: '', licensePlate: '',
  });
  const [prefs, setPrefs] = useState({ smoking: false, music: true, pets: false, chat: true });
  const [langs, setLangs] = useState([]);
  const [isHandicapped,     setIsHandicapped]     = useState(false);
  const [handicapAccessible,setHandicapAccessible] = useState(false);
  const [nationality, setNationality] = useState('moroccan');
  const [gender,      setGender]      = useState('');
  const [country,     setCountry]     = useState('');
  const [birthDate,   setBirthDate]   = useState('');

  const [pwdForm,   setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  const [kycSelfie, setKycSelfie] = useState(null);
  const [kycCin,    setKycCin]    = useState(null);
  const [kycSaving, setKycSaving] = useState(false);

  const submitKyc = async () => {
    if (!kycSelfie || (!kycCin && !profile?.cinDoc)) { toast.error('Selfie et photo de la CIN requis.'); return; }
    setKycSaving(true);
    try {
      const fd = new FormData();
      if (kycSelfie) fd.append('kycSelfie', kycSelfie);
      if (kycCin)    fd.append('cinDoc', kycCin);
      const { data } = await api.post('/users/kyc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Vérification d\'identité soumise !');
      setProfile(p => ({ ...p, kycStatus: data.kycStatus }));
      setKycSelfie(null); setKycCin(null);
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur lors de la soumission.'); }
    finally { setKycSaving(false); }
  };

  useEffect(() => {
    const url = isMe ? '/users/me' : `/users/${id}`;
    api.get(url).then(({ data }) => {
      const u = data.user || data;
      setProfile(u);
      setRides(data.rides   || []);
      setReviews(data.reviews || []);
      if (isMe) {
        setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '', bio: u.bio || '', carModel: u.carModel || '', carColor: u.carColor || '', carYear: u.carYear || '', licensePlate: u.licensePlate || '' });
        setPrefs(u.preferences || { smoking: false, music: true, pets: false, chat: true });
        setLangs(u.languages || []);
        setIsHandicapped(u.isHandicapped || false);
        setHandicapAccessible(u.handicapAccessible || false);
        setNationality(u.nationality || 'moroccan');
        setGender(u.gender || '');
        setCountry(u.country || '');
        setBirthDate(u.birthDate ? u.birthDate.slice(0, 10) : '');
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && fd.append(k, v));
      fd.append('preferences', JSON.stringify(prefs));
      fd.append('languages', JSON.stringify(langs));
      fd.append('isHandicapped', isHandicapped);
      fd.append('handicapAccessible', handicapAccessible);
      fd.append('nationality', nationality);
      fd.append('gender', gender);
      fd.append('country', country);
      fd.append('birthDate', birthDate);
      Object.entries(docFiles).forEach(([k, f]) => fd.append(k, f));
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user); setProfile(data.user); setDocFiles({});
      toast.success('Profil mis à jour !');
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user); setProfile(data.user);
      toast.success('Photo mise à jour !');
    } catch { toast.error('Erreur upload photo'); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', { email: me.email, currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Mot de passe modifié !');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      setShowPwd(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Erreur'); }
    finally { setPwdSaving(false); }
  };

  const toggleLang = (lang) => setLangs(l => l.includes(lang) ? l.filter(x => x !== lang) : [...l, lang]);

  if (loading) return <Spinner size="lg" />;
  if (!profile) return <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>Utilisateur introuvable.</div>;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const prefConfig = [
    { k: 'smoking', label: 'Fumeur',     icon: Cigarette },
    { k: 'music',   label: 'Musique',    icon: Music },
    { k: 'pets',    label: 'Animaux',    icon: PawPrint },
    { k: 'chat',    label: 'Discussion', icon: MessageCircle },
  ];

  const verifBadge = (() => {
    if (profile.driverVerified) return { label: 'Conducteur vérifié', color: '#22C55E', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', Icon: ShieldCheck };
    if (profile.cinDoc || profile.permisDoc || profile.carteGriseDoc) return { label: 'Vérification en cours', color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)', Icon: AlertCircle };
    return null;
  })();

  const REVIEW_CRITERIA = [
    { key: 'punctuality',   label: 'Ponctualité' },
    { key: 'driving',       label: 'Conduite' },
    { key: 'communication', label: 'Communication' },
    { key: 'cleanliness',   label: 'Propreté' },
  ];
  const criteriaAverages = REVIEW_CRITERIA.map(c => {
    const vals = reviews.map(r => r[c.key]).filter(v => v != null && v > 0);
    return { ...c, avg: vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 10) / 10 : null };
  }).filter(c => c.avg != null);

  const submitResponse = async (reviewId) => {
    if (!responseText.trim()) return;
    try {
      const { data } = await api.post(`/reviews/${reviewId}/respond`, { response: responseText.trim() });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, response: data.review.response } : r));
      setRespondingId(null); setResponseText('');
      toast.success('Réponse publiée');
    } catch (e) { toast.error(e.response?.data?.message || 'Erreur'); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── PROFILE HEADER ── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
        <ZelligeStripe />

        {/* Cover area */}
        <div style={{ height: 110, background: 'linear-gradient(135deg, rgba(193,39,45,0.18) 0%, rgba(212,137,10,0.12) 50%, rgba(0,98,51,0.12) 100%)', position: 'relative', overflow: 'hidden' }}>
          {/* Geometric pattern */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: -10, left: `${i * 14}%`,
              width: 40, height: 40, borderRadius: 8, border: '1.5px solid rgba(193,39,45,0.12)',
              transform: `rotate(${i * 15}deg)`, opacity: 0.7,
            }} />
          ))}
          <div style={{ position: 'absolute', right: 20, bottom: 8, fontFamily: 'Amiri, serif', fontSize: 56, color: 'rgba(193,39,45,0.07)', fontWeight: 900, userSelect: 'none', lineHeight: 1 }}>رفيق الطريق</div>
          <div style={{ position: 'absolute', top: 12, left: 18, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(193,39,45,0.5)' }}>✦ ATLASWAY PROFILE</div>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {/* Avatar row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12, marginTop: -32 }}>
            <div style={{ position: 'relative' }}>
              {profile.photo
                ? <img src={profile.photo} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--card-bg)', boxShadow: '0 0 0 2px #C1272D40' }} />
                : <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#C1272D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: '#fff', border: '3px solid var(--card-bg)' }}>{profile.firstName?.[0]}</div>
              }
              {isMe && (
                <>
                  <button onClick={() => photoRef.current.click()} style={{
                    position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%',
                    background: '#C1272D', border: '2px solid var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}>
                    <Camera size={12} style={{ color: '#fff' }} />
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
                </>
              )}
            </div>

            {/* Action buttons for other profiles */}
            {!isMe && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <FriendButton userId={profile.id} />
                <Link to={`/messages?with=${profile.id}&name=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&photo=${encodeURIComponent(profile.photo || '')}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  <MessageSquare size={14} /> Message
                </Link>
              </div>
            )}
          </div>

          {/* Name + badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{profile.firstName} {profile.lastName}</h1>
            {profile.isHandicapped && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.10)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Accessibility size={10} /> PMR
              </span>
            )}
            {verifBadge && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: verifBadge.bg, color: verifBadge.color, border: `1px solid ${verifBadge.border}`, display: 'flex', alignItems: 'center', gap: 4 }}>
                <verifBadge.Icon size={10} /> {verifBadge.label}
              </span>
            )}
            {profile.kycStatus === 'approved' && (
              <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 99, background: 'rgba(59,130,246,0.10)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <ShieldCheck size={10} /> Identité vérifiée
              </span>
            )}
            {profile.nationality === 'moroccan' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>🇲🇦 Marocain</span>
            )}
            {profile.nationality === 'foreign' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-700)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                <Globe size={9} style={{ display: 'inline', marginRight: 3 }} />{profile.country || 'Étranger'}
              </span>
            )}
          </div>

          <StarDisplay rating={profile.avgRating || 0} count={profile.totalRatings || 0} />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Membre depuis {memberSince}</p>

          {profile.bio && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.55, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
            {[
              { value: profile.totalTrips || 0, label: 'Trajets', color: '#C1272D', suffix: '' },
              { value: (profile.avgRating || 0).toFixed(1), label: 'Note', color: '#F59E0B', suffix: '★' },
              { value: profile.totalRatings || 0, label: 'Avis', color: '#006233', suffix: '' },
            ].map(({ value, label, color, suffix }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: `${color}08`, border: `1px solid ${color}18` }}>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color, lineHeight: 1 }}>{value}{suffix}</p>
                <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
              </div>
            ))}
          </div>
          {(profile.languages || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              {(profile.languages || []).map(l => (
                <span key={l} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>{l}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reliability score */}
      {(profile.totalTrips > 0 || profile.driverVerified) && (
        <ReliabilityScore user={profile} />
      )}

      {/* ── Level & progression ── */}
      <LevelCard trips={profile.totalTrips || 0} rating={profile.avgRating || 0} />

      {/* ══════════════════════════════════════
          OWN PROFILE — edit mode
      ══════════════════════════════════════ */}
      {isMe ? (
        <>
          {/* KYC */}
          <SectionCard title="Vérification d'identité" icon={ShieldCheck} accent="#3B82F6">
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Soumettez un selfie + votre CIN pour obtenir le badge de confiance 🛡️
            </p>
            {profile.kycStatus === 'approved' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', fontSize: 13, fontWeight: 700 }}>
                <CheckCircle size={15} /> Votre identité est vérifiée.
              </div>
            ) : profile.kycStatus === 'pending' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B', fontSize: 13, fontWeight: 700 }}>
                <Clock size={15} /> Vérification en attente de validation.
              </div>
            ) : (
              <>
                {profile.kycStatus === 'rejected' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                    <AlertCircle size={15} /> Refusée. Merci de soumettre des documents valides.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  {[
                    { icon: Camera, label: 'Selfie', sub: 'Photo de votre visage', file: kycSelfie, setFile: setKycSelfie, capture: 'user' },
                    { icon: FileText, label: kycCin ? kycCin.name.slice(0,20) : (profile.cinDoc ? 'CIN déjà fournie' : 'CIN'), sub: 'Carte d\'identité nationale', file: kycCin, setFile: setKycCin },
                  ].map(({ icon: Icon, label, sub, file, setFile, capture }) => (
                    <label key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '16px 12px', borderRadius: 12, border: `2px dashed ${file ? '#3B82F6' : 'var(--border-color)'}`, background: 'var(--bg-700)', cursor: 'pointer', textAlign: 'center', transition: 'border-color .2s' }}>
                      <Icon size={20} style={{ color: '#3B82F6' }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</span>
                      <input type="file" accept="image/*,application/pdf" capture={capture} style={{ display: 'none' }} onChange={e => setFile(e.target.files[0] || null)} />
                    </label>
                  ))}
                </div>
                <button type="button" onClick={submitKyc} disabled={kycSaving} className="btn-primary"
                  style={{ width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                  {kycSaving ? 'Envoi…' : <><Upload size={14} /> Soumettre pour vérification</>}
                </button>
              </>
            )}
          </SectionCard>

          {/* Edit form */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Personal info */}
            <SectionCard title="Informations personnelles" icon={Flag} accent="#C1272D">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['firstName','Prénom'],['lastName','Nom']].map(([k,l]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{l}</label>
                      <input value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} className="input" style={{ fontSize: 14 }} />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Téléphone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+212 6XX XXX XXX" className="input" style={{ fontSize: 14 }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Date de naissance</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="input" style={{ flex: 1, fontSize: 14 }}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0,10)} min="1924-01-01" />
                    {birthDate && (() => {
                      const age = Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000));
                      return <span style={{ fontSize: 12, fontWeight: 800, padding: '5px 10px', borderRadius: 8, flexShrink: 0, background: 'rgba(193,39,45,0.08)', color: '#C1272D', border: '1px solid rgba(193,39,45,0.2)' }}>{age} ans</span>;
                    })()}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Bio <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({form.bio.length}/300)</span></label>
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Parlez de vous en quelques mots…" className="input" style={{ resize: 'none', fontSize: 14 }} rows={3} maxLength={300} />
                </div>

                {/* Genre */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Genre</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[{value:'femme',label:'Femme'},{value:'homme',label:'Homme'},{value:'',label:'Non spécifié'}].map(opt => (
                      <button key={opt.value||'none'} type="button" onClick={() => setGender(opt.value)}
                        style={{ padding: '9px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all .15s', background: gender === opt.value ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)', borderColor: gender === opt.value ? '#C1272D' : 'var(--border-color)', color: gender === opt.value ? '#C1272D' : 'var(--text-secondary)' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nationalité */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Nationalité</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[{value:'moroccan',Icon:Flag,label:'Marocain(e)'},{value:'foreign',Icon:Globe,label:'Étranger(ère)'}].map(opt => (
                      <button key={opt.value} type="button" onClick={() => setNationality(opt.value)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid', transition: 'all .15s', background: nationality === opt.value ? 'rgba(193,39,45,0.08)' : 'var(--bg-700)', borderColor: nationality === opt.value ? '#C1272D' : 'var(--border-color)', color: nationality === opt.value ? '#C1272D' : 'var(--text-secondary)' }}>
                        <opt.Icon size={15} />{opt.label}
                      </button>
                    ))}
                  </div>
                  {nationality === 'foreign' && (
                    <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Pays d'origine" className="input" style={{ marginTop: 8, fontSize: 14 }} />
                  )}
                </div>

                {/* Langues */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Langues parlées</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {LANGUAGES.map(l => (
                      <button key={l} type="button" onClick={() => toggleLang(l)}
                        style={{ fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, cursor: 'pointer', border: '1.5px solid', transition: 'all .15s', background: langs.includes(l) ? 'rgba(193,39,45,0.10)' : 'var(--bg-700)', borderColor: langs.includes(l) ? '#C1272D' : 'var(--border-color)', color: langs.includes(l) ? '#C1272D' : 'var(--text-muted)' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PMR toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                  <Accessibility size={18} style={{ color: '#3B82F6', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Je suis une personne à mobilité réduite (PMR)</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Affiche un badge sur votre profil</p>
                  </div>
                  <Toggle checked={isHandicapped} onChange={setIsHandicapped} color="#3B82F6" />
                  <input type="checkbox" checked={isHandicapped} onChange={e => setIsHandicapped(e.target.checked)} style={{ display: 'none' }} />
                </label>
              </div>
            </SectionCard>

            {/* Préférences */}
            <SectionCard title="Préférences de voyage" icon={Music} accent="#D4890A">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {prefConfig.map(({ k, label, icon: Icon }) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 10, cursor: 'pointer', background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                    <Icon size={15} style={{ color: prefs[k] ? '#C1272D' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                    <Toggle checked={prefs[k]} onChange={v => setPrefs({...prefs, [k]: v})} />
                    <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs({...prefs, [k]: e.target.checked})} style={{ display: 'none' }} />
                  </label>
                ))}
              </div>
            </SectionCard>

            {/* Véhicule */}
            <SectionCard title="Informations véhicule" icon={Car} accent="#006233">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[['carModel','Marque / Modèle','ex: Dacia Sandero'],['carColor','Couleur','ex: Blanc']].map(([k,l,p]) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{l}</label>
                      <input value={form[k]} onChange={e => setForm({...form, [k]: e.target.value})} placeholder={p} className="input" style={{ fontSize: 14 }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Année</label>
                    <input type="number" value={form.carYear} onChange={e => setForm({...form, carYear: e.target.value})} placeholder="ex: 2020" className="input" style={{ fontSize: 14 }} min="1990" max="2030" />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Plaque</label>
                    <input value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value})} placeholder="ex: 12345-A-1" className="input" style={{ fontSize: 14 }} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderRadius: 10, cursor: 'pointer', background: 'var(--bg-700)', border: '1px solid var(--border-color)' }}>
                  <Accessibility size={16} style={{ color: '#3B82F6', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Véhicule accessible aux PMR</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mon véhicule est adapté aux personnes à mobilité réduite</p>
                  </div>
                  <Toggle checked={handicapAccessible} onChange={setHandicapAccessible} color="#3B82F6" />
                  <input type="checkbox" checked={handicapAccessible} onChange={e => setHandicapAccessible(e.target.checked)} style={{ display: 'none' }} />
                </label>
              </div>
            </SectionCard>

            {/* Documents */}
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
              <div style={{ height: 3, background: profile.driverVerified ? '#22C55E' : '#6B7280' }} />
              <div style={{ padding: '14px 18px' }}>
                <button type="button" onClick={() => setShowDocs(!showDocs)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                    <Shield size={16} style={{ color: profile.driverVerified ? '#22C55E' : 'var(--text-muted)', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Vérification conducteur</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>CIN · Permis · Carte grise</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {profile.driverVerified
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={12} /> Vérifié</span>
                      : (profile.cinDoc && profile.permisDoc && profile.carteGriseDoc)
                        ? <span style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}>En attente</span>
                        : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Non soumis</span>
                    }
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: showDocs ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                  </div>
                </button>

                {showDocs && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {profile.driverVerified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E', fontSize: 13, fontWeight: 700 }}>
                        <ShieldCheck size={14} /> Compte conducteur vérifié par l'administration.
                      </div>
                    )}
                    {!profile.driverVerified && (profile.cinDoc || profile.permisDoc || profile.carteGriseDoc) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontSize: 13, fontWeight: 700 }}>
                        <AlertCircle size={14} /> Documents en cours de vérification.
                      </div>
                    )}
                    {nationality === 'foreign'
                      ? <DocUploadField label="Passeport" fieldName="passportDoc" currentDoc={profile.passportDoc} onChange={(k,f) => setDocFiles(d => ({...d,[k]:f}))} required />
                      : <DocUploadField label="Carte Nationale d'Identité (CIN)" fieldName="cinDoc" currentDoc={profile.cinDoc} onChange={(k,f) => setDocFiles(d => ({...d,[k]:f}))} required />
                    }
                    <DocUploadField label="Permis de conduire" fieldName="permisDoc" currentDoc={profile.permisDoc} onChange={(k,f) => setDocFiles(d => ({...d,[k]:f}))} required />
                    <DocUploadField label="Carte grise du véhicule" fieldName="carteGriseDoc" currentDoc={profile.carteGriseDoc} onChange={(k,f) => setDocFiles(d => ({...d,[k]:f}))} required />
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Documents traités de manière confidentielle.</p>
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary"
              style={{ height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 800, borderRadius: 12 }}>
              <Save size={15} /> {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
            </button>
          </form>

          {/* Password */}
          <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border-color)' }}>
            <div style={{ height: 3, background: '#6B7280' }} />
            <div style={{ padding: '14px 18px' }}>
              <button onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>Changer le mot de passe</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)', transform: showPwd ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {showPwd && (
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                  {['currentPassword','newPassword','confirm'].map((k, i) => (
                    <div key={k}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                        {['Mot de passe actuel','Nouveau mot de passe','Confirmer le nouveau'][i]}
                      </label>
                      <input type="password" value={pwdForm[k]} onChange={e => setPwdForm({...pwdForm, [k]: e.target.value})} className="input" style={{ fontSize: 14 }} required minLength={i > 0 ? 8 : 1} />
                    </div>
                  ))}
                  <button type="submit" disabled={pwdSaving} className="btn-primary"
                    style={{ height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13 }}>
                    <Lock size={14} /> {pwdSaving ? 'Modification…' : 'Modifier le mot de passe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ══════════════════════════════════════
           PUBLIC PROFILE view
        ══════════════════════════════════════ */
        <>
          {/* Préférences publiques */}
          <SectionCard title="Préférences de voyage" icon={Music} accent="#D4890A">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {prefConfig.map(({ k, label, icon: Icon }) => {
                const active = (profile.preferences || {})[k];
                return (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: active ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.06)', color: active ? '#22C55E' : '#F87171', border: `1px solid ${active ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                    <Icon size={12} /> {label}
                  </span>
                );
              })}
              {profile.handicapAccessible && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, background: 'rgba(59,130,246,0.08)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Accessibility size={12} /> Accessible PMR
                </span>
              )}
            </div>
          </SectionCard>

          {/* Véhicule */}
          {profile.isDriver && (profile.carModel || profile.carColor) && (
            <SectionCard title="Véhicule" icon={Car} accent="#006233">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {profile.carPhoto && <img src={profile.carPhoto} alt="" style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border-color)' }} />}
                <div>
                  {profile.carModel && <p style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>{profile.carModel}</p>}
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{[profile.carColor, profile.carYear].filter(Boolean).join(' · ')}</p>
                  {profile.driverVerified && (
                    <p style={{ fontSize: 11, color: '#22C55E', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={11} /> Conducteur vérifié</p>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Trajets */}
          {rides.length > 0 && (
            <SectionCard title="Prochains trajets" icon={MapPin} accent="#C1272D">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rides.map(r => (
                  <Link key={r.id} to={`/rides/${r.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderRadius: 10, background: 'var(--bg-700)', border: '1px solid var(--border-color)', textDecoration: 'none', transition: 'border-color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#C1272D'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <MapPin size={13} style={{ color: '#C1272D', flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.from} → {r.to}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={10} /> {new Date(r.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{Number(r.price).toFixed(0)} DH</span>
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}

          {rides.length === 0 && reviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--card-bg)', borderRadius: 14, border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: 13 }}>
              Aucun trajet ni avis pour le moment.
            </div>
          )}
        </>
      )}

      {/* ── REVIEWS (commun) ── */}
      {reviews.length > 0 && (
        <SectionCard title={`Avis reçus · ${reviews.length}`} icon={Star} accent="#F59E0B">

          {/* Criteria averages */}
          {criteriaAverages.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
              {criteriaAverages.map(c => (
                <div key={c.key} style={{ textAlign: 'center', padding: '10px 8px', borderRadius: 10, background: 'var(--bg-700)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <Star size={13} style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                    <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: 15 }}>{c.avg}</span>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, fontWeight: 600 }}>{c.label}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {reviews.map((r, rIdx) => {
              const crit = REVIEW_CRITERIA.filter(c => r[c.key] != null && r[c.key] > 0);
              const isLast = rIdx === reviews.length - 1;
              return (
                <div key={r.id} style={{ paddingBottom: isLast ? 0 : 16, borderBottom: isLast ? 'none' : '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    {r.reviewer?.photo
                      ? <img src={r.reviewer.photo} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                      : <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{r.reviewer?.firstName?.[0]}</div>
                    }
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                      <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                        {[1,2,3,4,5].map(s => <Star key={s} size={11} style={{ color: s <= r.rating ? '#F59E0B' : 'var(--border-color)', fill: s <= r.rating ? '#F59E0B' : 'none' }} />)}
                      </div>
                    </div>
                  </div>

                  {r.comment && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>{r.comment}</p>}

                  {crit.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                      {crit.map(c => (
                        <span key={c.key} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-700)', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          {c.label} <Star size={8} style={{ color: '#F59E0B', fill: '#F59E0B' }} /> {r[c.key]}
                        </span>
                      ))}
                    </div>
                  )}

                  {r.response && (
                    <div style={{ marginTop: 10, marginLeft: 12, paddingLeft: 12, borderLeft: '2px solid rgba(193,39,45,0.3)' }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#C1272D', marginBottom: 3 }}>Réponse de {profile.firstName}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.response}</p>
                    </div>
                  )}

                  {isMe && !r.response && (
                    respondingId === r.id ? (
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <input value={responseText} onChange={e => setResponseText(e.target.value)}
                          placeholder="Votre réponse…" className="input" style={{ fontSize: 13, flex: 1 }} />
                        <button onClick={() => submitResponse(r.id)} className="btn-primary" style={{ height: 40, padding: '0 14px', fontSize: 12 }}>Publier</button>
                        <button onClick={() => { setRespondingId(null); setResponseText(''); }} style={{ height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-700)', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => { setRespondingId(r.id); setResponseText(''); }}
                        style={{ fontSize: 12, fontWeight: 700, color: '#C1272D', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}>
                        Répondre
                      </button>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
