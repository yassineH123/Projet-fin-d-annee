import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Camera, Save, Lock, MapPin, Clock, Star, ChevronRight,
  Car, FileText, Shield, ShieldCheck, Accessibility,
  Music, Cigarette, PawPrint, MessageCircle, Upload, CheckCircle, AlertCircle, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import FriendButton from '../components/FriendButton';
import ReliabilityScore from '../components/ReliabilityScore';

const LANGUAGES = ['Français', 'Arabe', 'Darija', 'Amazigh', 'Anglais', 'Espagnol'];

function StarDisplay({ rating, count }) {
  return (
    <div className="flex items-center gap-1.5 mt-1">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={13} className={s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
      ))}
      {count > 0 && <span className="text-slate-400 text-xs">({count} avis)</span>}
    </div>
  );
}

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
      <label className="text-sm text-slate-400 mb-1.5 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div
        onClick={() => ref.current.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition
          ${hasDoc ? 'border-green-500/50 bg-green-500/5' : 'border-dark-500 hover:border-primary-500/50 bg-dark-700'}`}
      >
        {hasDoc ? (
          preview === 'pdf' || (currentDoc && currentDoc.endsWith('.pdf')) ? (
            <div className="flex items-center gap-2 text-green-400">
              <FileText size={20} />
              <span className="text-sm font-medium">Document chargé</span>
              <CheckCircle size={16} />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <img src={preview || currentDoc} alt="" className="w-12 h-12 object-cover rounded-lg" />
              <span className="text-green-400 text-sm font-medium flex items-center gap-1"><CheckCircle size={14} /> Chargé</span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <Upload size={18} />
            <span className="text-sm">Cliquer pour uploader (image ou PDF)</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={handleChange} />
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
  const [isHandicapped, setIsHandicapped]     = useState(false);
  const [handicapAccessible, setHandicapAccessible] = useState(false);

  const [pwdForm,   setPwdForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    const url = isMe ? '/users/me' : `/users/${id}`;
    api.get(url).then(({ data }) => {
      const u = data.user || data;
      setProfile(u);
      setRides(data.rides   || []);
      setReviews(data.reviews || []);
      if (isMe) {
        setForm({
          firstName:    u.firstName    || '',
          lastName:     u.lastName     || '',
          phone:        u.phone        || '',
          bio:          u.bio          || '',
          carModel:     u.carModel     || '',
          carColor:     u.carColor     || '',
          carYear:      u.carYear      || '',
          licensePlate: u.licensePlate || '',
        });
        setPrefs(u.preferences || { smoking: false, music: true, pets: false, chat: true });
        setLangs(u.languages   || []);
        setIsHandicapped(u.isHandicapped       || false);
        setHandicapAccessible(u.handicapAccessible || false);
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && fd.append(k, v));
      fd.append('preferences',       JSON.stringify(prefs));
      fd.append('languages',         JSON.stringify(langs));
      fd.append('isHandicapped',     isHandicapped);
      fd.append('handicapAccessible', handicapAccessible);
      Object.entries(docFiles).forEach(([k, f]) => fd.append(k, f));
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setProfile(data.user);
      setDocFiles({});
      toast.success('Profil mis à jour !');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    try {
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setProfile(data.user);
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
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally { setPwdSaving(false); }
  };

  const toggleLang = (lang) => setLangs(l => l.includes(lang) ? l.filter(x => x !== lang) : [...l, lang]);

  if (loading) return <Spinner size="lg" />;
  if (!profile) return <div className="text-center py-20 text-slate-400">Utilisateur introuvable.</div>;

  const memberSince = new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const prefConfig = [
    { k: 'smoking', label: 'Fumeur',     icon: Cigarette },
    { k: 'music',   label: 'Musique',    icon: Music },
    { k: 'pets',    label: 'Animaux',    icon: PawPrint },
    { k: 'chat',    label: 'Discussion', icon: MessageCircle },
  ];

  const verifStatus = () => {
    if (profile.driverVerified) return { label: 'Conducteur vérifié', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: ShieldCheck };
    if (profile.cinDoc || profile.permisDoc || profile.carteGriseDoc) return { label: 'Vérification en cours', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: AlertCircle };
    return null;
  };
  const verifBadge = verifStatus();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* ── HEADER ── */}
      <div className="card">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="relative shrink-0">
            {profile.photo
              ? <img src={profile.photo} alt="" className="w-24 h-24 rounded-full object-cover ring-2 ring-primary-500/40" />
              : <div className="w-24 h-24 rounded-full bg-primary-700 flex items-center justify-center text-4xl font-black text-white">{profile.firstName?.[0]}</div>
            }
            {isMe && (
              <>
                <button onClick={() => photoRef.current.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition">
                  <Camera size={14} className="text-white" />
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile.firstName} {profile.lastName}</h1>
              {profile.isHandicapped && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  <Accessibility size={11} /> PMR
                </span>
              )}
              {verifBadge && (
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${verifBadge.bg} ${verifBadge.color}`}>
                  <verifBadge.icon size={11} /> {verifBadge.label}
                </span>
              )}
            </div>
            <StarDisplay rating={profile.avgRating || 0} count={profile.totalRatings || 0} />
            <p className="text-slate-500 text-xs mt-1">Membre depuis {memberSince}</p>
            {profile.bio && <p className="text-slate-400 text-sm mt-2">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <p className="text-white font-bold text-lg">{profile.totalTrips || 0}</p>
                <p className="text-slate-500 text-xs">Trajets</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">{(profile.avgRating || 0).toFixed(1)}</p>
                <p className="text-slate-500 text-xs">Note moy.</p>
              </div>
              {(profile.languages || []).length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  {(profile.languages || []).map(l => (
                    <span key={l} className="text-xs px-2 py-0.5 rounded-full bg-dark-600 border border-dark-500 text-slate-300">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons — only on someone else's profile */}
          {!isMe && (
            <div className="flex flex-wrap gap-2 mt-4">
              <FriendButton userId={profile.id} />
              <Link
                to={`/messages?with=${profile.id}&name=${encodeURIComponent(profile.firstName + ' ' + profile.lastName)}&photo=${encodeURIComponent(profile.photo || '')}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'var(--bg-700)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#C1272D'; e.currentTarget.style.color = '#C1272D'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <MessageSquare size={15} /> Message
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Score de fiabilité — visible par tous */}
      {profile.totalTrips > 0 || profile.driverVerified ? (
        <div className="mt-6">
          <ReliabilityScore user={profile} />
        </div>
      ) : null}

      {isMe ? (
        <>
          {/* ── FORMULAIRE EDITION ── */}
          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* Infos de base */}
            <div className="card">
              <h2 className="font-bold text-white mb-5">Informations personnelles</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Prénom</label>
                    <input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Nom</label>
                    <input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Téléphone</label>
                  <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+212 6XX XXX XXX" className="input" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Parlez de vous en quelques mots..." className="input resize-none" rows={3} maxLength={300} />
                  <p className="text-slate-600 text-xs mt-1 text-right">{form.bio.length}/300</p>
                </div>

                {/* Langues */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Langues parlées</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(l => (
                      <button key={l} type="button" onClick={() => toggleLang(l)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition ${langs.includes(l) ? 'bg-primary-500/20 border-primary-500 text-primary-400' : 'bg-dark-700 border-dark-500 text-slate-400 hover:border-dark-400'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handicap passager */}
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-dark-700 rounded-xl border border-dark-500 hover:border-blue-500/40 transition">
                  <Accessibility size={18} className="text-blue-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Je suis une personne à mobilité réduite (PMR)</p>
                    <p className="text-xs text-slate-500">Affiche un badge sur votre profil pour informer les conducteurs</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${isHandicapped ? 'bg-blue-500' : 'bg-dark-500'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isHandicapped ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <input type="checkbox" checked={isHandicapped} onChange={e => setIsHandicapped(e.target.checked)} className="sr-only" />
                </label>
              </div>
            </div>

            {/* Préférences de voyage */}
            <div className="card">
              <h2 className="font-bold text-white mb-4">Préférences de voyage</h2>
              <div className="grid grid-cols-2 gap-3">
                {prefConfig.map(({ k, label, icon: Icon }) => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer p-3 bg-dark-700 rounded-xl border border-dark-500 hover:border-dark-400 transition">
                    <Icon size={16} className={prefs[k] ? 'text-primary-400' : 'text-slate-500'} />
                    <span className="text-sm text-slate-300 flex-1">{label}</span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${prefs[k] ? 'bg-primary-500' : 'bg-dark-500'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs[k] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <input type="checkbox" checked={prefs[k]} onChange={e => setPrefs({...prefs, [k]: e.target.checked})} className="sr-only" />
                  </label>
                ))}
              </div>
            </div>

            {/* Véhicule */}
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Car size={18} className="text-primary-400" /> Informations véhicule</h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Marque / Modèle</label>
                    <input value={form.carModel} onChange={e => setForm({...form, carModel: e.target.value})} placeholder="ex: Dacia Sandero" className="input" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Couleur</label>
                    <input value={form.carColor} onChange={e => setForm({...form, carColor: e.target.value})} placeholder="ex: Blanc" className="input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Année</label>
                    <input type="number" value={form.carYear} onChange={e => setForm({...form, carYear: e.target.value})} placeholder="ex: 2020" className="input" min="1990" max="2030" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1.5 block">Plaque d'immatriculation</label>
                    <input value={form.licensePlate} onChange={e => setForm({...form, licensePlate: e.target.value})} placeholder="ex: 12345-A-1" className="input" />
                  </div>
                </div>

                {/* Accessibilité véhicule */}
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-dark-700 rounded-xl border border-dark-500 hover:border-blue-500/40 transition">
                  <Accessibility size={18} className="text-blue-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">Véhicule accessible aux PMR</p>
                    <p className="text-xs text-slate-500">Mon véhicule est adapté aux personnes à mobilité réduite</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative transition-colors shrink-0 ${handicapAccessible ? 'bg-blue-500' : 'bg-dark-500'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${handicapAccessible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <input type="checkbox" checked={handicapAccessible} onChange={e => setHandicapAccessible(e.target.checked)} className="sr-only" />
                </label>
              </div>
            </div>

            {/* Documents vérification */}
            <div className="card">
              <button type="button" onClick={() => setShowDocs(!showDocs)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Shield size={18} className={profile.driverVerified ? 'text-green-400' : 'text-slate-400'} />
                  <div className="text-left">
                    <p className="font-bold text-white">Vérification conducteur</p>
                    <p className="text-xs text-slate-500">CIN, Permis de conduire, Carte grise — obligatoires</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.driverVerified
                    ? <span className="text-xs text-green-400 flex items-center gap-1"><ShieldCheck size={13} /> Vérifié</span>
                    : (profile.cinDoc && profile.permisDoc && profile.carteGriseDoc)
                      ? <span className="text-xs text-yellow-400">En attente</span>
                      : <span className="text-xs text-slate-500">Non soumis</span>
                  }
                  <ChevronRight size={18} className={`text-slate-500 transition-transform ${showDocs ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {showDocs && (
                <div className="mt-5 pt-5 border-t border-dark-500 flex flex-col gap-4">
                  {profile.driverVerified && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm">
                      <ShieldCheck size={16} /> Votre compte conducteur est vérifié par l'administration.
                    </div>
                  )}
                  {!profile.driverVerified && (profile.cinDoc || profile.permisDoc || profile.carteGriseDoc) && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
                      <AlertCircle size={16} /> Documents en cours de vérification par l'administration.
                    </div>
                  )}
                  <DocUploadField label="Carte Nationale d'Identité (CIN)" fieldName="cinDoc" currentDoc={profile.cinDoc} onChange={(k, f) => setDocFiles(d => ({...d, [k]: f}))} required />
                  <DocUploadField label="Permis de conduire" fieldName="permisDoc" currentDoc={profile.permisDoc} onChange={(k, f) => setDocFiles(d => ({...d, [k]: f}))} required />
                  <DocUploadField label="Carte grise du véhicule" fieldName="carteGriseDoc" currentDoc={profile.carteGriseDoc} onChange={(k, f) => setDocFiles(d => ({...d, [k]: f}))} required />
                  <p className="text-slate-500 text-xs">Les documents sont traités de manière confidentielle et servent uniquement à la vérification de votre identité.</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 h-12 rounded-xl">
              <Save size={16} /> {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
            </button>
          </form>

          {/* ── MOT DE PASSE ── */}
          <div className="card">
            <button onClick={() => setShowPwd(!showPwd)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-400" />
                <span className="font-bold text-white">Changer le mot de passe</span>
              </div>
              <ChevronRight size={18} className={`text-slate-500 transition-transform ${showPwd ? 'rotate-90' : ''}`} />
            </button>
            {showPwd && (
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 mt-5 pt-5 border-t border-dark-500">
                {['currentPassword','newPassword','confirm'].map((k, i) => (
                  <div key={k}>
                    <label className="text-sm text-slate-400 mb-1.5 block">
                      {['Mot de passe actuel','Nouveau mot de passe','Confirmer le nouveau'][i]}
                    </label>
                    <input type="password" value={pwdForm[k]} onChange={e => setPwdForm({...pwdForm, [k]: e.target.value})} className="input" required minLength={i > 0 ? 8 : 1} />
                  </div>
                ))}
                <button type="submit" disabled={pwdSaving} className="btn-primary h-11 flex items-center justify-center gap-2">
                  <Lock size={15} /> {pwdSaving ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        /* ── VUE PUBLIQUE ── */
        <>
          {/* Préférences */}
          <div className="card">
            <h2 className="font-bold text-white mb-4">Préférences de voyage</h2>
            <div className="flex flex-wrap gap-2">
              {prefConfig.map(({ k, label, icon: Icon }) => (
                <span key={k} className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${(profile.preferences || {})[k] ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  <Icon size={13} /> {label}
                </span>
              ))}
              {profile.handicapAccessible && (
                <span className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <Accessibility size={13} /> Accessible PMR
                </span>
              )}
            </div>
          </div>

          {/* Véhicule (si conducteur vérifié) */}
          {profile.isDriver && (profile.carModel || profile.carColor) && (
            <div className="card">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2"><Car size={18} className="text-primary-400" /> Véhicule</h2>
              <div className="flex items-center gap-4">
                {profile.carPhoto && <img src={profile.carPhoto} alt="véhicule" className="w-24 h-16 object-cover rounded-xl border border-dark-500" />}
                <div>
                  {profile.carModel && <p className="text-white font-semibold">{profile.carModel}</p>}
                  <p className="text-slate-400 text-sm">
                    {[profile.carColor, profile.carYear].filter(Boolean).join(' · ')}
                  </p>
                  {profile.driverVerified && (
                    <p className="flex items-center gap-1 text-green-400 text-xs mt-1"><ShieldCheck size={12} /> Conducteur vérifié</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trajets */}
          {rides.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-4">Prochains trajets</h2>
              <div className="flex flex-col gap-3">
                {rides.map(r => (
                  <Link key={r.id} to={`/rides/${r.id}`} className="flex items-center justify-between p-3 bg-dark-700 rounded-xl border border-dark-500 hover:border-primary-500/50 transition group">
                    <div className="flex items-center gap-3">
                      <MapPin size={15} className="text-primary-400 shrink-0" />
                      <div>
                        <p className="text-white text-sm font-semibold group-hover:text-primary-400 transition">{r.from} → {r.to}</p>
                        <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          {new Date(r.departureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-white font-bold text-sm">{Number(r.price).toFixed(0)} MAD</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Avis */}
          {reviews.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-4">Avis reçus</h2>
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r.id} className="border-b border-dark-500 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {r.reviewer?.photo
                        ? <img src={r.reviewer.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-white">{r.reviewer?.firstName?.[0]}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-white">{r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />)}
                        </div>
                      </div>
                    </div>
                    {r.comment && <p className="text-slate-400 text-sm">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {rides.length === 0 && reviews.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-slate-500 text-sm">Aucun trajet ni avis pour le moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
