import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Save, Lock, MapPin, Clock, Star, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StarDisplay } from '../components/StarRating';
import Spinner from '../components/Spinner';

export default function Profile() {
  const { id } = useParams();
  const { user: me, updateUser } = useAuth();
  const isMe = !id || id === me?.id;
  const fileRef = useRef();

  const [profile,  setProfile]  = useState(null);
  const [rides,    setRides]    = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', bio: '' });
  const [prefs, setPrefs] = useState({ smoking: false, music: true, pets: false, chat: true });

  // Password change
  const [pwdForm,  setPwdForm]  = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);

  useEffect(() => {
    const url = isMe ? '/users/me' : `/users/${id}`;
    api.get(url).then(({ data }) => {
      setProfile(data.user);
      setRides(data.rides  || []);
      setReviews(data.reviews || []);
      if (isMe) {
        setForm({ firstName: data.user.firstName || '', lastName: data.user.lastName || '', phone: data.user.phone || '', bio: data.user.bio || '' });
        setPrefs(data.user.preferences || { smoking: false, music: true, pets: false, chat: true });
      }
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('preferences', JSON.stringify(prefs));
      const { data } = await api.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      updateUser(data.user);
      setProfile(data.user);
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
    } catch {
      toast.error('Erreur upload photo');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setPwdSaving(true);
    try {
      await api.post('/auth/change-password', {
        email: me.email,
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      toast.success('Mot de passe modifié !');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) return <Spinner size="lg" />;
  if (!profile) return <div className="text-center py-20 text-slate-400">Utilisateur introuvable.</div>;

  const prefLabels = [['smoking','Fumeur'],['music','Musique'],['pets','Animaux'],['chat','Discussion']];
  const memberSince = new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Header card */}
      <div className="card">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            {profile.photo
              ? <img src={profile.photo} alt="" className="w-20 h-20 rounded-full object-cover ring-2 ring-dark-500" />
              : <div className="w-20 h-20 rounded-full bg-primary-700 flex items-center justify-center text-3xl font-black text-white">{profile.firstName?.[0]}</div>
            }
            {isMe && (
              <>
                <button onClick={() => fileRef.current.click()} className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition">
                  <Camera size={14} className="text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{profile.firstName} {profile.lastName}</h1>
            <StarDisplay rating={profile.avgRating} count={profile.totalRatings} />
            <p className="text-slate-500 text-xs mt-1">Membre depuis {memberSince}</p>
            {profile.bio && <p className="text-slate-400 text-sm mt-2 max-w-md">{profile.bio}</p>}
          </div>
        </div>
      </div>

      {isMe ? (
        <>
          {/* Edit form */}
          <div className="card">
            <h2 className="font-bold text-white mb-5">Modifier mon profil</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Prénom</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Nom</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Téléphone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212 6XX XXX XXX" className="input" />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Parlez de vous..." className="input resize-none" rows={3} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-3 block">Préférences de voyage</label>
                <div className="grid grid-cols-2 gap-3">
                  {prefLabels.map(([k, label]) => (
                    <label key={k} className="flex items-center gap-3 cursor-pointer p-3 bg-dark-700 rounded-xl border border-dark-500 hover:border-dark-400 transition">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${prefs[k] ? 'bg-primary-500' : 'bg-dark-500'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${prefs[k] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-slate-300">{label}</span>
                      <input type="checkbox" checked={prefs[k]} onChange={(e) => setPrefs({ ...prefs, [k]: e.target.checked })} className="sr-only" />
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2 h-11">
                <Save size={15} /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </form>
          </div>

          {/* Password change */}
          <div className="card">
            <button
              onClick={() => setShowPwd(!showPwd)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-400" />
                <span className="font-bold text-white">Changer le mot de passe</span>
              </div>
              <ChevronRight size={18} className={`text-slate-500 transition-transform ${showPwd ? 'rotate-90' : ''}`} />
            </button>

            {showPwd && (
              <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 mt-5 pt-5 border-t border-dark-500">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Mot de passe actuel</label>
                  <input
                    type="password"
                    value={pwdForm.currentPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Nouveau mot de passe</label>
                  <input
                    type="password"
                    value={pwdForm.newPassword}
                    onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                    className="input"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    value={pwdForm.confirm}
                    onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <button type="submit" disabled={pwdSaving} className="btn-primary h-11 flex items-center justify-center gap-2">
                  <Lock size={15} /> {pwdSaving ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </form>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Preferences (public view) */}
          <div className="card">
            <h2 className="font-bold text-white mb-4">Préférences de voyage</h2>
            <div className="flex flex-wrap gap-3">
              {prefLabels.map(([k, label]) => (
                <span key={k} className={`text-sm font-medium px-3 py-1.5 rounded-full ${(profile.preferences || {})[k] ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {(profile.preferences || {})[k] ? '✓' : '✗'} {label}
                </span>
              ))}
            </div>
          </div>

          {/* Public rides */}
          {rides.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-4">Prochains trajets</h2>
              <div className="flex flex-col gap-3">
                {rides.map((r) => (
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

          {/* Public reviews */}
          {reviews.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-white mb-4">Avis reçus</h2>
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-dark-500 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      {r.reviewer?.photo
                        ? <img src={r.reviewer.photo} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-white">{r.reviewer?.firstName?.[0]}</div>
                      }
                      <div>
                        <p className="text-sm font-semibold text-white">{r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={11} className={s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />
                          ))}
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
